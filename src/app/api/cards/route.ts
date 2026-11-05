import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { getOrCreateUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getOrCreateUser();
  const rows = await db
    .select()
    .from(cards)
    .where(eq(cards.ownerUserId, user.id))
    .orderBy(desc(cards.createdAt));
  return NextResponse.json({ cards: rows });
}
