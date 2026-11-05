import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { getOrCreateUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getOrCreateUser();
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(30);
  return NextResponse.json({ notifications: rows });
}

export async function POST() {
  const user = await getOrCreateUser();
  await db.update(notifications).set({ readAt: new Date() }).where(eq(notifications.userId, user.id));
  return NextResponse.json({ ok: true });
}
