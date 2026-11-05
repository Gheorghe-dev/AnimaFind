import { NextResponse } from "next/server";
import { db } from "@/db";
import { rounds } from "@/db/schema";
import { getOrCreateUser } from "@/lib/session";
import { checkScanRateLimit, spendCan, syncCans } from "@/lib/economy";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getOrCreateUser();
  if (!user.gdprConsentAt) {
    return NextResponse.json({ error: "Consent required." }, { status: 403 });
  }

  const limit = await checkScanRateLimit(user.id);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: `Server rate limit reached (${limit.limit} rounds/hour). Take a walk, come back soon.` },
      { status: 429 },
    );
  }

  const spent = await spendCan(user.id, user.isPremiumActive);
  if (!spent) {
    const cans = await syncCans(user.id, user.isPremiumActive);
    return NextResponse.json({ error: "No cans left.", cans }, { status: 402 });
  }

  const [round] = await db.insert(rounds).values({ userId: user.id, attemptsLeft: 3 }).returning();
  return NextResponse.json({ roundId: round.id, attemptsLeft: round.attemptsLeft, cans: spent });
}
