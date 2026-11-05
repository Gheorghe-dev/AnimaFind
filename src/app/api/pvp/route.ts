import { NextResponse } from "next/server";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { pvpVotes } from "@/db/schema";
import { getOrCreateUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export const PVP_OPTIONS = [
  { id: "duel", label: "1v1 turn-based duels (3 cards each)" },
  { id: "raid", label: "Co-op raids against a giant boss critter" },
  { id: "league", label: "Weekly neighbourhood league + leaderboard" },
  { id: "draft", label: "Draft mode: build a deck from friends' albums" },
];

export async function GET() {
  const user = await getOrCreateUser();
  const counts = await db
    .select({ option: pvpVotes.option, count: sql<number>`count(*)::int` })
    .from(pvpVotes)
    .groupBy(pvpVotes.option);
  const mine = await db.select().from(pvpVotes).where(eq(pvpVotes.userId, user.id));
  return NextResponse.json({
    options: PVP_OPTIONS.map((o) => ({
      ...o,
      votes: counts.find((c) => c.option === o.id)?.count ?? 0,
      voted: mine.some((m) => m.option === o.id),
    })),
  });
}

export async function POST(request: Request) {
  const user = await getOrCreateUser();
  const { option } = (await request.json()) as { option?: string };
  if (!option || !PVP_OPTIONS.some((o) => o.id === option)) {
    return NextResponse.json({ error: "Unknown option." }, { status: 400 });
  }
  const existing = await db
    .select()
    .from(pvpVotes)
    .where(and(eq(pvpVotes.userId, user.id), eq(pvpVotes.option, option)));
  if (existing.length) {
    await db.delete(pvpVotes).where(and(eq(pvpVotes.userId, user.id), eq(pvpVotes.option, option)));
  } else {
    await db.insert(pvpVotes).values({ userId: user.id, option });
  }
  return NextResponse.json({ ok: true });
}
