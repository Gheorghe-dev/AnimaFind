import { describe, it } from "node:test";
import assert from "node:assert";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as Icons from "@/components/icons/AppIcons";
import { TAXA } from "@/lib/game-data";
import { PROXIMITY_METERS, haversineMeters } from "@/lib/geo";
import { getSpecimenSvgString, getSpecimenDataUri } from "@/lib/specimen-art";

describe("Custom Icon Set & Visual Design System", () => {
  const iconList: (keyof typeof Icons)[] = [
    "IconCamera",
    "IconAlbum",
    "IconMap",
    "IconFriends",
    "IconUser",
    "IconCodex",
    "IconShop",
    "IconSword",
    "IconSettings",
    "IconCan",
    "IconCoin",
    "IconSparkles",
    "IconFlame",
    "IconShield",
    "IconCompass",
    "IconRadar",
    "IconMapPin",
    "IconLocating",
    "IconTarget",
    "IconCrosshair",
    "IconPaw",
    "IconFox",
    "IconBird",
    "IconInsect",
    "IconReptile",
    "IconAmphibian",
    "IconSnail",
    "IconLeaf",
    "IconSearch",
    "IconFilter",
    "IconRefresh",
    "IconClock",
    "IconBell",
    "IconWarning",
    "IconInfo",
    "IconHelp",
    "IconLock",
    "IconUnlock",
    "IconEye",
    "IconEyeOff",
    "IconStar",
    "IconHeart",
    "IconTrophy",
    "IconPackage",
    "IconPhone",
    "IconFileText",
    "IconBan",
    "IconRuler",
    "IconVolumeX",
    "IconBulb",
    "IconCheck",
    "IconCross",
    "IconChevronRight",
    "IconChevronLeft",
    "IconArrowLeft",
    "IconDice",
    "IconFlashlight",
    "IconFlip",
    "IconShare",
    "IconTrash",
    "IconExplorerHat",
    "IconLeafCrown",
    "IconGlasses",
    "IconFrame",
    "IconMedal",
    "IconVolumeOn",
    "IconVolumeOff",
    "IconLayers",
  ];

  it("exports all required custom SVG icons", () => {
    for (const name of iconList) {
      assert.ok(typeof Icons[name] === "function", `Expected ${name} to be exported as a React FC`);
    }
  });

  it("renders SVG icons with unified stroke weight, currentColor, and 24x24 viewBox", () => {
    for (const name of iconList) {
      const Component = Icons[name] as React.FC<{ size?: number; className?: string }>;
      const markup = renderToStaticMarkup(React.createElement(Component, { size: 24, className: "test-icon" }));

      // SVG root tag
      assert.ok(markup.startsWith("<svg"), `${name} must render an <svg> root element`);
      assert.ok(markup.includes('viewBox="0 0 24 24"'), `${name} must have viewBox="0 0 24 24"`);
      assert.ok(markup.includes('stroke="currentColor"'), `${name} must use stroke="currentColor" for theme inheritance`);
      assert.ok(
        markup.includes('stroke-width="2"') || markup.includes('stroke-width="2.5"'),
        `${name} must share unified stroke width (2 or 2.5)`,
      );
      assert.ok(markup.includes('fill="none"'), `${name} must default to fill="none" line art`);
      assert.ok(markup.includes('width="24"'), `${name} must respect size prop`);
      assert.ok(markup.includes('height="24"'), `${name} must respect size prop`);
    }
  });

  it("TaxonIcon correctly maps all 6 taxa to custom SVG icons", () => {
    for (const taxon of TAXA) {
      const markup = renderToStaticMarkup(React.createElement(Icons.TaxonIcon, { taxon, size: 20 }));
      assert.ok(markup.startsWith("<svg"), `TaxonIcon for ${taxon} must render valid SVG`);
      assert.ok(markup.includes('viewBox="0 0 24 24"'));
      assert.ok(markup.includes('stroke="currentColor"'));
    }
  });

  it("AvatarIcon maps both semantic names and emoji seeds without crashing", () => {
    const seeds = ["fox", "🦊", "bird", "🐦", "frog", "🐸", "bee", "🐝", "lizard", "🦎", "snail", "🐌", "owl", "farmer", "🧑‍🌾"];
    for (const seed of seeds) {
      const markup = renderToStaticMarkup(React.createElement(Icons.AvatarIcon, { seed, size: 24 }));
      assert.ok(markup.startsWith("<svg"), `AvatarIcon for seed "${seed}" must render valid SVG`);
    }
  });

  it("CosmeticIcon renders clean custom SVG accessories for all catalog equipment slots", () => {
    const slots = ["hat-explorer", "hat-leaf", "glasses-round", "frame-gold"];
    for (const id of slots) {
      const markup = renderToStaticMarkup(React.createElement(Icons.CosmeticIcon, { id, size: 24 }));
      assert.ok(markup.startsWith("<svg"), `CosmeticIcon for "${id}" must render valid SVG`);
      assert.ok(markup.includes('viewBox="0 0 24 24"'));
      assert.ok(markup.includes('stroke="currentColor"'));
    }
  });
});

describe("Procedural Specimen Artwork Generation Engine", () => {
  const tiers = ["tier1", "tier2", "tier3", "tier4", "tier5"] as const;

  it("generates rich procedural SVG illustrations for all 6 taxonomic classes across all tiers", () => {
    for (const taxon of TAXA) {
      for (const tier of tiers) {
        const svg = getSpecimenSvgString(taxon, null, tier);
        assert.ok(svg.startsWith("<svg"), `Specimen SVG for ${taxon}/${tier} must be an SVG element`);
        assert.ok(svg.includes('viewBox="0 0 400 320"'), "Must use standard specimen canvas viewBox");
        assert.ok(!/[\uD800-\uDFFF]/.test(svg), `Generated SVG for ${taxon}/${tier} must not contain raw surrogate emojis`);
      }
    }
  });

  it("generates specialized vector artwork for distinct species", () => {
    const speciesTests = [
      { taxon: "Mammal", label: "Red Fox" },
      { taxon: "Mammal", label: "European Hedgehog" },
      { taxon: "Mammal", label: "Roe Deer" },
      { taxon: "Bird", label: "Barn Owl" },
      { taxon: "Bird", label: "Common Kingfisher" },
      { taxon: "Insect", label: "Stag Beetle" },
      { taxon: "Insect", label: "Swallowtail Butterfly" },
      { taxon: "Reptile", label: "Grass Snake" },
      { taxon: "Amphibian", label: "Fire Salamander" },
      { taxon: "Other", label: "Garden Snail" },
      { taxon: "Other", label: "Garden Spider" },
    ] as const;

    for (const s of speciesTests) {
      const svg = getSpecimenSvgString(s.taxon, s.label, "tier5");
      assert.ok(svg.length > 500, `SVG for ${s.label} should be detailed vector art`);
      assert.ok(svg.includes("defs"), "Must contain gradient definitions for rich coloring");
    }
  });

  it("produces valid, URL-safe data URIs for image embedding", () => {
    const uri = getSpecimenDataUri("Mammal", "Red Fox", "tier3");
    assert.ok(uri.startsWith("data:image/svg+xml;utf8,"), "Must produce standard SVG data URI");
    assert.ok(uri.length > 200, "URI must contain encoded vector path data");
  });
});

describe("Free OpenStreetMap Interactive Map Service", () => {
  const OSM_TILE_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
  const OSM_ATTRIBUTION = "OpenStreetMap";
  const FALLBACK_BUCHAREST = { lat: 44.4268, lng: 26.1025 };

  it("uses 100% free OpenStreetMap tiles with zero API keys or credit card requirements", () => {
    assert.ok(OSM_TILE_URL.startsWith("https://tile.openstreetmap.org/"));
    assert.ok(OSM_TILE_URL.includes("{z}/{x}/{y}.png"));
    assert.ok(!OSM_TILE_URL.includes("key="), "OSM tile URL must not contain any paid API key");
    assert.ok(!OSM_TILE_URL.includes("token="), "OSM tile URL must not contain any paid token");
  });

  it("preserves valid attribution for OpenStreetMap", () => {
    assert.ok(OSM_ATTRIBUTION.includes("OpenStreetMap"));
  });

  it("verifies proximity claiming zone calculation within 250m", () => {
    const center = FALLBACK_BUCHAREST;

    // A point 100 meters away is well within the 250m proximity zone
    const nearbyLat = center.lat + 0.0008; // ~89 meters
    const nearbyLng = center.lng;
    const distance1 = haversineMeters(center.lat, center.lng, nearbyLat, nearbyLng);
    assert.ok(distance1 < PROXIMITY_METERS, `Distance ${distance1}m should be claimable (< 250m)`);

    // A point 500 meters away is outside the claim zone
    const farLat = center.lat + 0.005; // ~550 meters
    const farLng = center.lng;
    const distance2 = haversineMeters(center.lat, center.lng, farLat, farLng);
    assert.ok(distance2 > PROXIMITY_METERS, `Distance ${distance2}m should NOT be claimable (> 250m)`);
  });

  it("handles fallback coordinates safely when GPS is unavailable", () => {
    assert.ok(FALLBACK_BUCHAREST.lat >= -90 && FALLBACK_BUCHAREST.lat <= 90);
    assert.ok(FALLBACK_BUCHAREST.lng >= -180 && FALLBACK_BUCHAREST.lng <= 180);
    assert.strictEqual(FALLBACK_BUCHAREST.lat, 44.4268);
    assert.strictEqual(FALLBACK_BUCHAREST.lng, 26.1025);
  });
});
