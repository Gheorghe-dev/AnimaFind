import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getOrCreateUser } from "@/lib/session";
import { buildMePayload } from "@/lib/payload";
import { COSMETICS } from "@/lib/game-data";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getOrCreateUser();
  const body = (await request.json()) as {
    username?: string;
    avatarSeed?: string;
    equip?: string | null;
    locationConsent?: boolean;
  };

  const cosmetics = { ...(user.cosmetics ?? {}) };
  if (body.equip !== undefined && body.equip !== null) {
    if (COSMETICS[body.equip] && user.ownedCosmetics.includes(body.equip)) {
      const slot = COSMETICS[body.equip].slot;
      cosmetics[slot] = cosmetics[slot] === body.equip ? undefined : body.equip;
    }
    // silently skip equip if not owned — other fields still save
  }

  const [updated] = await db
    .update(users)
    .set({
      username: body.username?.trim() ? body.username.trim().slice(0, 24) : user.username,
      avatarSeed: body.avatarSeed ?? user.avatarSeed,
      cosmetics,
      locationConsent: body.locationConsent ?? user.locationConsent,
    })
    .where(eq(users.id, user.id))
    .returning();

  return NextResponse.json(await buildMePayload(updated));
}
