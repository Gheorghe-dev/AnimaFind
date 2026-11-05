import { sql } from "drizzle-orm";
import { db } from "@/db";
import { serialCounters } from "@/db/schema";
import type { RarityTier } from "./game-data";

/** Serial numbers are incremented per rarity tier, globally across all players. */
export async function nextSerial(tier: RarityTier): Promise<number> {
  const [row] = await db
    .insert(serialCounters)
    .values({ tier, value: 1 })
    .onConflictDoUpdate({
      target: serialCounters.tier,
      set: { value: sql`${serialCounters.value} + 1` },
    })
    .returning();
  return row.value;
}
