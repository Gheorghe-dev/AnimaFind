import { NextResponse } from "next/server";
import { and, eq, ne, or } from "drizzle-orm";
import { db } from "@/db";
import { friendships, users } from "@/db/schema";
import { getOrCreateUser } from "@/lib/session";
import { userStats } from "@/lib/payload";
import { levelForXp } from "@/lib/game-data";

export const dynamic = "force-dynamic";

async function summarize(userId: string, username: string, avatarSeed: string, xp: number) {
  const stats = await userStats(userId);
  return { id: userId, username, avatarSeed, level: levelForXp(xp).level, ...stats };
}

export async function GET() {
  const me = await getOrCreateUser();
  const links = await db
    .select()
    .from(friendships)
    .where(or(eq(friendships.userId, me.id), eq(friendships.friendId, me.id)));

  const friends = [];
  const incoming = [];
  const outgoing = [];
  for (const link of links) {
    const otherId = link.userId === me.id ? link.friendId : link.userId;
    const [other] = await db.select().from(users).where(eq(users.id, otherId)).limit(1);
    if (!other) continue;
    const summary = { ...(await summarize(other.id, other.username, other.avatarSeed, other.xp)), linkId: link.id };
    if (link.status === "accepted") friends.push(summary);
    else if (link.friendId === me.id) incoming.push(summary);
    else outgoing.push(summary);
  }

  const known = new Set([me.id, ...links.flatMap((l) => [l.userId, l.friendId])]);
  const others = await db.select().from(users).where(ne(users.id, me.id)).limit(20);
  const suggestions = others
    .filter((u) => !known.has(u.id))
    .slice(0, 6)
    .map((u) => ({ id: u.id, username: u.username, avatarSeed: u.avatarSeed, level: levelForXp(u.xp).level }));

  return NextResponse.json({
    me: await summarize(me.id, me.username, me.avatarSeed, me.xp),
    friends,
    incoming,
    outgoing,
    suggestions,
  });
}

export async function POST(request: Request) {
  const me = await getOrCreateUser();
  const body = (await request.json()) as { action: string; userId?: string; username?: string; linkId?: string };

  if (body.action === "add") {
    let targetId = body.userId;
    if (!targetId && body.username) {
      const [target] = await db.select().from(users).where(eq(users.username, body.username.trim())).limit(1);
      if (!target) return NextResponse.json({ error: "No naturalist with that name." }, { status: 404 });
      targetId = target.id;
    }
    if (!targetId || targetId === me.id) return NextResponse.json({ error: "Invalid target." }, { status: 400 });
    const existing = await db
      .select()
      .from(friendships)
      .where(
        or(
          and(eq(friendships.userId, me.id), eq(friendships.friendId, targetId)),
          and(eq(friendships.userId, targetId), eq(friendships.friendId, me.id)),
        ),
      );
    if (existing.length) return NextResponse.json({ error: "Already connected." }, { status: 409 });
    await db.insert(friendships).values({ userId: me.id, friendId: targetId, status: "pending" });
    return NextResponse.json({ ok: true });
  }

  if (body.action === "accept" && body.linkId) {
    await db
      .update(friendships)
      .set({ status: "accepted" })
      .where(and(eq(friendships.id, body.linkId), eq(friendships.friendId, me.id)));
    return NextResponse.json({ ok: true });
  }

  if (body.action === "remove" && body.linkId) {
    await db
      .delete(friendships)
      .where(
        and(
          eq(friendships.id, body.linkId),
          or(eq(friendships.userId, me.id), eq(friendships.friendId, me.id)),
        ),
      );
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action." }, { status: 400 });
}
