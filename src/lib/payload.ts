import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cards, sightings } from "@/db/schema";
import { syncCans } from "./economy";
import { RARITY_META, levelForXp, type RarityTier } from "./game-data";
import type { SessionUser } from "./session";

export async function userStats(userId: string) {
  const [agg] = await db
    .select({
      totalCards: sql<number>`count(*)::int`,
      species: sql<number>`count(distinct ${cards.speciesLabel})::int`,
    })
    .from(cards)
    .where(eq(cards.ownerUserId, userId));

  const [sightingAgg] = await db
    .select({ total: sql<number>`count(*)::int` })
    .from(sightings)
    .where(eq(sightings.userId, userId));

  const owned = await db
    .select({ tier: cards.rarityTier, name: cards.generatedName, id: cards.id })
    .from(cards)
    .where(eq(cards.ownerUserId, userId))
    .orderBy(desc(cards.createdAt));

  const byTier: Record<string, number> = { tier1: 0, tier2: 0, tier3: 0, tier4: 0, tier5: 0 };
  let rarest: { id: string; name: string; tier: RarityTier } | null = null;
  for (const c of owned) {
    byTier[c.tier] = (byTier[c.tier] ?? 0) + 1;
    const tier = c.tier as RarityTier;
    if (!rarest || RARITY_META[tier].rank > RARITY_META[rarest.tier].rank) {
      rarest = { id: c.id, name: c.name, tier };
    }
  }

  return {
    totalCards: agg?.totalCards ?? 0,
    speciesDiversity: agg?.species ?? 0,
    totalSightings: sightingAgg?.total ?? 0,
    byTier,
    rarest,
  };
}

export async function buildMePayload(user: SessionUser) {
  const cans = await syncCans(user.id, user.isPremiumActive);
  const stats = await userStats(user.id);
  const lvl = levelForXp(user.xp);
  return {
    user: {
      id: user.id,
      username: user.username,
      avatarSeed: user.avatarSeed,
      xp: user.xp,
      coins: user.coins,
      streakCount: user.streakCount,
      cosmetics: user.cosmetics,
      ownedCosmetics: user.ownedCosmetics,
      isPremiumActive: user.isPremiumActive,
      gdprConsentAt: user.gdprConsentAt,
      locationConsent: user.locationConsent,
      ageConfirmed: user.ageConfirmed,
      deletionRequestedAt: user.deletionRequestedAt,
      createdAt: user.createdAt,
      ...lvl,
    },
    cans,
    stats,
  };
}

export type MePayload = Awaited<ReturnType<typeof buildMePayload>>;
