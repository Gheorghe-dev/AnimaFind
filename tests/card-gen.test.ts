import { describe, it } from "node:test";
import assert from "node:assert";
import {
  generateCard,
  generateName,
  generateAbilities,
  rollRarity,
  speciesInfo,
} from "@/lib/card-gen";
import { TAXA, TIER_ORDER, RARITY_META, SPECIES } from "@/lib/game-data";

describe("Card Generation & Math Engine", () => {
  it("resolves species information correctly and case-insensitively", () => {
    const fox = speciesInfo("Red Fox");
    assert.ok(fox, "Should find Red Fox");
    assert.strictEqual(fox?.taxon, "Mammal");

    const lowerFox = speciesInfo("red fox");
    assert.ok(lowerFox, "Should find red fox with lowercase");
    assert.strictEqual(lowerFox?.taxon, "Mammal");

    const unknown = speciesInfo("Martian Unicorn");
    assert.strictEqual(unknown, undefined, "Non-existent species returns undefined");

    const nullLookup = speciesInfo(null);
    assert.strictEqual(nullLookup, undefined, "Null lookup returns undefined");
  });

  it("rolls valid rarity tiers respecting rarity bounds", () => {
    const counts: Record<string, number> = { tier1: 0, tier2: 0, tier3: 0, tier4: 0, tier5: 0 };
    for (let i = 0; i < 500; i++) {
      const tier = rollRarity(2);
      assert.ok(TIER_ORDER.includes(tier), `Rolled tier ${tier} should be valid`);
      counts[tier]++;
    }
    // Tier 1 and Tier 2 should be rolled most frequently given standard commonness
    assert.ok(counts.tier1 > 0, "Tier 1 should be rolled");
    assert.ok(counts.tier2 > 0, "Tier 2 should be rolled");
  });

  it("generates structured names for all taxa", () => {
    for (const taxon of TAXA) {
      const name = generateName(taxon);
      assert.ok(typeof name === "string" && name.length > 5, `Name for ${taxon} should be a non-empty string`);
      const words = name.split(" ");
      assert.ok(words.length >= 3, `Name "${name}" should have Title, Adjective, Noun`);
    }
  });

  it("scales abilities according to rarity tiers", () => {
    for (const tier of TIER_ORDER) {
      const abilities = generateAbilities("Bird", tier);
      const meta = RARITY_META[tier];
      if (meta.rank >= 4) {
        assert.ok(abilities.length >= 3, `High tier ${tier} should have >= 3 abilities`);
      } else if (meta.rank >= 2) {
        assert.ok(abilities.length >= 2, `Mid tier ${tier} should have >= 2 abilities`);
      } else {
        assert.ok(abilities.length >= 1, `Tier 1 should have >= 1 ability`);
      }
    }
  });

  it("generates a complete card with valid stats and rewards", () => {
    for (const taxon of TAXA) {
      const card = generateCard(taxon, "Red Fox");
      assert.ok(card.generatedName, "Card must have a generated name");
      assert.strictEqual(card.taxonCategory, taxon);
      assert.ok(card.statA >= 1 && card.statA <= 99, `statA ${card.statA} must be within 1..99`);
      assert.ok(card.statB >= 1 && card.statB <= 99, `statB ${card.statB} must be within 1..99`);
      assert.ok(card.statC >= 1 && card.statC <= 99, `statC ${card.statC} must be within 1..99`);
      assert.ok(card.xpAwarded > 0, "Card must award XP");
      assert.ok(card.coinsAwarded > 0, "Card must award coins");
      assert.ok(Array.isArray(card.abilities) && card.abilities.length > 0, "Card must have abilities");
    }
  });
});
