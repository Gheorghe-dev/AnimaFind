import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { resourceBalances, scanEvents, users } from "@/db/schema";

export type CanState = {
  current: number;
  max: number;
  rechargeRateMinutes: number;
  secondsUntilNext: number | null;
  lastRechargeAt: string;
};

export const PREMIUM_RATE_MINUTES = 10;
export const FREE_RATE_MINUTES = 25;
export const PREMIUM_MAX = 8;
export const FREE_MAX = 5;

/**
 * Server-authoritative recharge. The client clock is never trusted: the amount
 * of cans regenerated is derived from `lastRechargeAt` stored in Postgres.
 */
export async function syncCans(userId: string, isPremium: boolean): Promise<CanState> {
  let [row] = await db.select().from(resourceBalances).where(eq(resourceBalances.userId, userId)).limit(1);
  if (!row) {
    [row] = await db.insert(resourceBalances).values({ userId }).returning();
  }

  const rate = isPremium ? PREMIUM_RATE_MINUTES : FREE_RATE_MINUTES;
  const max = Math.max(isPremium ? PREMIUM_MAX : FREE_MAX, row.max > 8 ? row.max : 0) || FREE_MAX;
  const now = Date.now();
  const last = new Date(row.lastRechargeAt).getTime();
  const elapsedMs = Math.max(0, now - last);
  const rateMs = rate * 60_000;

  let current = row.current;
  let lastRechargeAt = new Date(last);

  if (current < max) {
    const gained = Math.floor(elapsedMs / rateMs);
    if (gained > 0) {
      current = Math.min(max, current + gained);
      lastRechargeAt = new Date(last + gained * rateMs);
    }
  } else {
    lastRechargeAt = new Date(now);
  }

  if (current !== row.current || rate !== row.rechargeRateMinutes || max !== row.max) {
    await db
      .update(resourceBalances)
      .set({ current, max, rechargeRateMinutes: rate, lastRechargeAt })
      .where(eq(resourceBalances.userId, userId));
  } else if (lastRechargeAt.getTime() !== last) {
    await db.update(resourceBalances).set({ lastRechargeAt }).where(eq(resourceBalances.userId, userId));
  }

  const secondsUntilNext =
    current >= max ? null : Math.max(1, Math.ceil((rateMs - (now - lastRechargeAt.getTime())) / 1000));

  return {
    current,
    max,
    rechargeRateMinutes: rate,
    secondsUntilNext,
    lastRechargeAt: lastRechargeAt.toISOString(),
  };
}

export async function spendCan(userId: string, isPremium: boolean): Promise<CanState | null> {
  const state = await syncCans(userId, isPremium);
  if (state.current <= 0) return null;
  const now = new Date();
  const [updated] = await db
    .update(resourceBalances)
    .set({
      current: state.current - 1,
      // starting the timer when the stock drops from full
      lastRechargeAt: state.current === state.max ? now : new Date(state.lastRechargeAt),
    })
    .where(eq(resourceBalances.userId, userId))
    .returning();
  return {
    ...state,
    current: updated.current,
    secondsUntilNext: state.rechargeRateMinutes * 60,
    lastRechargeAt: updated.lastRechargeAt.toISOString(),
  };
}

export async function grantCans(userId: string, amount: number, isPremium: boolean) {
  const state = await syncCans(userId, isPremium);
  const current = Math.min(state.max + amount, state.current + amount);
  await db.update(resourceBalances).set({ current }).where(eq(resourceBalances.userId, userId));
  return { ...state, current };
}

/** Hard server-side ceiling so a tampered client can not farm sightings. */
export async function checkScanRateLimit(userId: string, limitPerHour = 20) {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(scanEvents)
    .where(and(eq(scanEvents.userId, userId), gte(scanEvents.createdAt, since)));
  return { allowed: (row?.count ?? 0) < limitPerHour, used: row?.count ?? 0, limit: limitPerHour };
}

export async function logScanEvent(userId: string) {
  await db.insert(scanEvents).values({ userId });
}

export async function awardProgress(userId: string, xp: number, coins: number) {
  const today = new Date().toISOString().slice(0, 10);
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  let streak = user.streakCount;
  if (user.lastActiveDate !== today) {
    const yesterday = new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
    streak = user.lastActiveDate === yesterday ? streak + 1 : 1;
  }
  const [updated] = await db
    .update(users)
    .set({ xp: user.xp + xp, coins: user.coins + coins, streakCount: streak, lastActiveDate: today })
    .where(eq(users.id, userId))
    .returning();
  return updated;
}
