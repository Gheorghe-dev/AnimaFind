import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import { localStore } from "@/lib/local-store";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Re-initialise the store between tests so each one runs against a clean state. */
async function freshStore() {
  // deleteAccount() resets the in-memory data and clears localStorage
  localStore.deleteAccount();
  // Give consent so round-based helpers work in subsequent tests
  await localStore.saveConsent({
    gdprConsent: true,
    ageConfirmed: true,
    locationConsent: true,
    username: "TestNaturalist",
  });
}

// ---------------------------------------------------------------------------
// Account data-export
// ---------------------------------------------------------------------------

describe("exportAccount – GDPR data export", () => {
  beforeEach(async () => {
    await freshStore();
  });

  it("returns a JSON-serialisable object with the expected top-level keys", () => {
    const exported = localStore.exportAccount();
    assert.ok(typeof exported === "object" && exported !== null, "Must be an object");
    assert.ok("exportedAt" in exported, "Must contain exportedAt timestamp");
    assert.ok("user" in exported, "Must contain user");
    assert.ok("cardsCount" in exported, "Must contain cardsCount");
    assert.ok(Array.isArray(exported.cards), "cards must be an array");
    assert.ok(Array.isArray(exported.sightings), "sightings must be an array");
  });

  it("exportedAt is a valid ISO-8601 timestamp", () => {
    const exported = localStore.exportAccount();
    const ts = new Date(exported.exportedAt);
    assert.ok(!isNaN(ts.getTime()), "exportedAt must parse as a valid date");
  });

  it("cardsCount matches the actual length of the cards array", () => {
    const exported = localStore.exportAccount();
    assert.strictEqual(exported.cardsCount, exported.cards.length, "cardsCount must equal cards.length");
  });

  it("export captures a newly minted card", async () => {
    const round = await localStore.startRound();
    await localStore.submitSighting({
      roundId: round.roundId,
      photo: "data:image/svg+xml;utf8,<svg/>",
      taxon: "Bird",
      species: "Common Blackbird",
      lat: 51.5,
      lng: -0.1,
      motionScore: 0.02,
      screenScore: 0.05,
    });

    const exported = localStore.exportAccount();
    assert.ok(exported.cards.length >= 1, "Export must include the newly minted card");
    assert.strictEqual(exported.cardsCount, exported.cards.length);

    // User data inside export must match persisted profile
    const me = await localStore.getMe();
    assert.strictEqual(exported.user.id, me.user.id, "Exported user ID must match live profile");
  });
});

// ---------------------------------------------------------------------------
// Account deletion
// ---------------------------------------------------------------------------

describe("deleteAccount – full data wipe", () => {
  beforeEach(async () => {
    await freshStore();
  });

  it("returns { ok: true }", () => {
    const result = localStore.deleteAccount();
    assert.strictEqual(result.ok, true);
  });

  it("resets profile to a fresh anonymous state after deletion", async () => {
    // First mint a card so there is real data to wipe
    const round = await localStore.startRound();
    await localStore.submitSighting({
      roundId: round.roundId,
      photo: "data:image/svg+xml;utf8,<svg/>",
      taxon: "Insect",
      species: "Red Admiral",
      lat: 51.5,
      lng: -0.1,
      motionScore: 0.01,
      screenScore: 0.03,
    });

    const beforeDelete = localStore.getCards();
    assert.ok(beforeDelete.length >= 1, "Must have at least one card before delete");

    localStore.deleteAccount();

    const afterDelete = localStore.getCards();
    assert.strictEqual(afterDelete.length, 0, "Card deck must be empty after account deletion");
  });

  it("drops the custom-added friend after deletion; demo friends re-seed from initial data", async () => {
    // Add a friend
    await localStore.friendAction({ action: "add", username: "WillowTracker" });
    const beforeDelete = await localStore.getFriends();
    const hasWillow = beforeDelete.friends.some((f) => f.username === "WillowTracker");
    assert.ok(hasWillow, "WillowTracker must appear before deletion");

    localStore.deleteAccount();

    const afterDelete = await localStore.getFriends();
    // After deleteAccount the store resets to getInitialData() which seeds demo friends.
    // Confirm that the custom-added friend is gone.
    const willowGone = !afterDelete.friends.some((f) => f.username === "WillowTracker");
    assert.ok(willowGone, "WillowTracker must NOT appear after account deletion");
    // And the demo friends from initial data are present (the app starts alive).
    assert.ok(afterDelete.friends.length >= 2, "Demo friends from initial data must be re-seeded");
  });

  it("app is usable again from a fresh state after deletion (new consent cycle)", async () => {
    localStore.deleteAccount();

    // startRound() is synchronous — use assert.throws
    assert.throws(
      () => localStore.startRound(),
      (err: Error) => err.message === "Consent required.",
      "Should require fresh consent after account deletion",
    );

    // Give consent again
    await localStore.saveConsent({
      gdprConsent: true,
      ageConfirmed: true,
      locationConsent: false,
      username: "RebornScout",
    });

    const me = await localStore.getMe();
    assert.strictEqual(me.user.username, "RebornScout", "New username must be persisted");
    assert.ok(me.user.gdprConsentAt, "Fresh consent timestamp must be set");
  });
});

// ---------------------------------------------------------------------------
// Seeded map pins – no emoji SVG text nodes
// ---------------------------------------------------------------------------

describe("getMapPins – procedural seeding uses specimen-art, not emoji SVG", () => {
  beforeEach(async () => {
    await freshStore();
  });

  it("returns a non-empty pins array near a provided coordinate", () => {
    const { pins } = localStore.getMapPins(44.4268, 26.1025);
    assert.ok(pins.length > 0, "Must return at least one pin near the viewer coordinate");
  });

  it("every pin thumbnailUrl is a data URI (not a bare emoji character)", () => {
    const { pins } = localStore.getMapPins(44.4268, 26.1025);
    for (const pin of pins) {
      assert.ok(
        pin.thumbnailUrl.startsWith("data:"),
        `Pin thumbnailUrl must be a data URI, got: ${pin.thumbnailUrl.slice(0, 60)}`,
      );
    }
  });

  it("seeded pin SVGs contain path/circle vector elements, not raw <text> emoji nodes", () => {
    const { pins } = localStore.getMapPins(48.8566, 2.3522);
    // Filter only the procedurally seeded pins (data URIs containing SVG)
    const svgPins = pins.filter((p) => p.thumbnailUrl.includes("image/svg+xml"));
    assert.ok(svgPins.length > 0, "Must have at least one SVG pin");

    for (const pin of svgPins) {
      // Decode the percent-encoded SVG
      const encoded = pin.thumbnailUrl.replace(/^data:image\/svg\+xml;utf8,/, "");
      const svg = decodeURIComponent(encoded);

      // The legacy path wrapped a bare emoji inside a <text> element
      assert.ok(
        !/<text[^>]*>\s*[\u{1F300}-\u{1FFFF}]/u.test(svg),
        "SVG must NOT contain a raw emoji inside a <text> element (legacy path)",
      );

      // The modern path produces geometric shapes
      const hasVector = /<(path|circle|rect|ellipse|polygon|polyline|line)\b/.test(svg);
      assert.ok(hasVector, "SVG must contain at least one vector shape element from specimen-art");
    }
  });

  it("proximityMeters is a positive finite number", () => {
    const { proximityMeters } = localStore.getMapPins(44.4268, 26.1025);
    assert.ok(Number.isFinite(proximityMeters) && proximityMeters > 0, "proximityMeters must be positive and finite");
  });

  it("falls back gracefully when no coordinates are provided", () => {
    const { pins } = localStore.getMapPins();
    assert.ok(Array.isArray(pins), "Must return an array even without coordinates");
  });
});
