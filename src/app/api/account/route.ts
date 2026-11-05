import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cards, friendships, notifications, resourceBalances, rounds, scanEvents, sightings, users } from "@/db/schema";
import { getOrCreateUser, SESSION_COOKIE } from "@/lib/session";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

/** GDPR data export. */
export async function GET() {
  const user = await getOrCreateUser();
  const [mySightings, myCards] = await Promise.all([
    db.select().from(sightings).where(eq(sightings.userId, user.id)),
    db.select().from(cards).where(eq(cards.ownerUserId, user.id)),
  ]);
  return NextResponse.json({
    exportedAt: new Date().toISOString(),
    profile: { ...user, id: undefined },
    sightings: mySightings.map((s) => ({ ...s, photoUrl: "[binary omitted from preview export]" })),
    cards: myCards.map((c) => ({ ...c, photoUrl: "[binary omitted from preview export]" })),
  });
}

/** Account deletion: immediate local wipe, backups purged within 30 days. */
export async function DELETE() {
  const user = await getOrCreateUser();
  await db.delete(cards).where(eq(cards.ownerUserId, user.id));
  await db.delete(sightings).where(eq(sightings.userId, user.id));
  await db.delete(rounds).where(eq(rounds.userId, user.id));
  await db.delete(scanEvents).where(eq(scanEvents.userId, user.id));
  await db.delete(notifications).where(eq(notifications.userId, user.id));
  await db.delete(resourceBalances).where(eq(resourceBalances.userId, user.id));
  await db.delete(friendships).where(eq(friendships.userId, user.id));
  await db.delete(friendships).where(eq(friendships.friendId, user.id));
  await db.delete(users).where(eq(users.id, user.id));
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true, purgeWithinDays: 30 });
}
