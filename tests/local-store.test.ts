import { describe, it } from "node:test";
import assert from "node:assert";
import { localStore } from "@/lib/local-store";

describe("Local-First Storage & Offline Game Engine", () => {
  it("initializes naturalist profile with starting balances and cans", async () => {
    const me = await localStore.getMe();
    assert.ok(me.user.id, "User must have an identifier");
    assert.ok(me.user.username.startsWith("FieldScout"), "Default username prefix");
    assert.ok(me.cans.current > 0, "User must start with cans");
    assert.strictEqual(me.cans.max, 5, "Free tier default max cans is 5");
    assert.strictEqual(me.cans.rechargeRateMinutes, 25, "Free tier recharge is 25 min");
    assert.ok(me.user.coins >= 50, "User starts with welcome coins");
  });

  it("updates user profile settings and consents", async () => {
    const updated = await localStore.updateProfile({
      username: "TrailTracker",
      avatarSeed: "🐿️",
      locationConsent: true,
    });
    assert.strictEqual(updated.user.username, "TrailTracker");
    assert.strictEqual(updated.user.avatarSeed, "🐿️");
    assert.strictEqual(updated.user.locationConsent, true);

    const reloaded = await localStore.getMe();
    assert.strictEqual(reloaded.user.username, "TrailTracker");
  });

  it("enforces consent gate before allowing scan rounds", async () => {
    // Before giving consent, startRound should be rejected
    await assert.rejects(async () => {
      await localStore.startRound();
    }, /Consent required/);

    // Save consent
    await localStore.saveConsent({
      gdprConsent: true,
      ageConfirmed: true,
      locationConsent: true,
      username: "ConsentedScout",
    });

    const me = await localStore.getMe();
    assert.ok(me.user.gdprConsentAt, "Consent timestamp should be recorded");
  });

  it("manages round lifecycle: start, attempts, and can consumption", async () => {
    const meBefore = await localStore.getMe();
    const startingCans = meBefore.cans.current;

    // Start a round
    const round = await localStore.startRound();
    assert.ok(round.roundId, "Round must have an ID");
    assert.strictEqual(round.attemptsLeft, 3, "Round starts with 3 attempts");

    // Can balance should decrement by 1
    const meAfterStart = await localStore.getMe();
    assert.strictEqual(meAfterStart.cans.current, startingCans - 1);

    // Attempt round
    const attempt1 = await localStore.attemptRound(round.roundId);
    assert.strictEqual(attempt1.attemptsLeft, 2);

    const attempt2 = await localStore.attemptRound(round.roundId);
    assert.strictEqual(attempt2.attemptsLeft, 1);
  });

  it("submits a sighting and mints a verified card", async () => {
    const round = await localStore.startRound();
    const photoMock = "data:image/svg+xml;utf8,<svg></svg>";

    const result = await localStore.submitSighting({
      roundId: round.roundId,
      photo: photoMock,
      taxon: "Mammal",
      species: "Red Fox",
      lat: 44.4268,
      lng: 26.1025,
      motionScore: 0.05,
      screenScore: 0.1,
    });

    assert.ok(result.card, "Result must contain generated card");
    assert.ok(result.card.id, "Card must have unique ID");
    assert.strictEqual(result.card.taxonCategory, "Mammal");
    assert.strictEqual(result.card.speciesLabel, "Red Fox");
    assert.strictEqual(result.sighting.verificationStatus, "verified");

    // Sighting and card should be retrieved in album
    const cards = localStore.getCards();
    assert.ok(cards.some((c) => c.id === result.card.id), "Minted card should be present in card deck");

    const fetchedCard = await localStore.getCard(result.card.id);
    assert.ok(fetchedCard, "Should fetch specific card");
    assert.strictEqual(fetchedCard?.card.id, result.card.id);

    // Delete card
    const deleted = localStore.deleteCard(result.card.id);
    assert.strictEqual(deleted, true);
    const afterDelete = await localStore.getCard(result.card.id);
    assert.strictEqual(afterDelete, null, "Card should no longer exist after deletion");
  });

  it("handles friend actions: add and list", async () => {
    const friendPayload = await localStore.getFriends();
    assert.ok(Array.isArray(friendPayload.friends), "Should return friends list");
    assert.ok(Array.isArray(friendPayload.suggestions), "Should return suggested naturalists");

    // Add friend from suggestions
    if (friendPayload.suggestions.length > 0) {
      const sug = friendPayload.suggestions[0];
      const addRes = await localStore.friendAction({ action: "add", userId: sug.id });
      assert.strictEqual(addRes.ok, true);
    }
  });

  it("handles PvP feature voting", async () => {
    const pvpData = await localStore.getPvp();
    assert.ok(pvpData.options.length > 0, "Should have voting options");

    const firstOpt = pvpData.options[0];
    const voteRes = await localStore.votePvp(firstOpt.id);
    assert.strictEqual(voteRes.ok, true);

    const afterVote = await localStore.getPvp();
    const updatedOpt = afterVote.options.find((o) => o.id === firstOpt.id);
    assert.strictEqual(updatedOpt?.voted, true);
  });
});
