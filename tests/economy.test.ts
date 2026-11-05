import { describe, it } from "node:test";
import assert from "node:assert";
import { STORE_CATALOG } from "@/lib/store-catalog";
import {
  PREMIUM_RATE_MINUTES,
  FREE_RATE_MINUTES,
  PREMIUM_MAX,
  FREE_MAX,
} from "@/lib/economy";

describe("Store Catalog & Economy Engine", () => {
  it("defines store catalog items with proper pricing and categories", () => {
    assert.ok(STORE_CATALOG.length > 0, "Catalog must not be empty");

    for (const item of STORE_CATALOG) {
      assert.ok(item.id, "Item must have id");
      assert.ok(item.name, "Item must have name");
      assert.ok(item.description, "Item must have description");
      assert.ok(typeof item.price === "number" && item.price >= 0, "Item must have non-negative price");
      assert.ok(["resourcePack", "cosmetic", "subscription"].includes(item.kind), `Item kind ${item.kind} must be valid`);
    }
  });

  it("enforces free and premium tier economy boundaries", () => {
    assert.strictEqual(FREE_MAX, 5, "Free max cans is 5");
    assert.strictEqual(PREMIUM_MAX, 8, "Premium max cans is 8");
    assert.strictEqual(FREE_RATE_MINUTES, 25, "Free recharge rate is 25 minutes");
    assert.strictEqual(PREMIUM_RATE_MINUTES, 10, "Premium recharge rate is 10 minutes");
    assert.ok(PREMIUM_RATE_MINUTES < FREE_RATE_MINUTES, "Premium recharge must be faster than free");
  });
});
