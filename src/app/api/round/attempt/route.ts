import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { rounds } from "@/db/schema";
import { getOrCreateUser } from "@/lib/session";

export const dynamic = "force-dynamic";

/** One toss consumed. Attempts are tracked server-side, never in the client. */
export async function POST(request: Request) {
  const user = await getOrCreateUser();
  const { roundId } = (await request.json()) as { roundId?: string };
  if (!roundId) return NextResponse.json({ error: "roundId required" }, { status: 400 });

  const [round] = await db
    .select()
    .from(rounds)
    .where(and(eq(rounds.id, roundId), eq(rounds.userId, user.id)))
    .limit(1);

  if (!round || round.status !== "active") {
    return NextResponse.json({ error: "Round is not active." }, { status: 409 });
  }

  const attemptsLeft = Math.max(0, round.attemptsLeft - 1);
  const [updated] = await db
    .update(rounds)
    .set({ attemptsLeft, status: attemptsLeft === 0 ? "spent" : "active" })
    .where(eq(rounds.id, roundId))
    .returning();

  return NextResponse.json({ attemptsLeft: updated.attemptsLeft, status: updated.status });
}
