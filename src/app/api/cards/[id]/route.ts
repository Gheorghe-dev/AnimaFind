import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { cards, sightings, users } from "@/db/schema";
import { getOrCreateUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  await getOrCreateUser();
  const [row] = await db
    .select({
      card: cards,
      sighting: sightings,
      ownerName: users.username,
    })
    .from(cards)
    .innerJoin(sightings, eq(sightings.id, cards.sightingId))
    .innerJoin(users, eq(users.id, cards.ownerUserId))
    .where(eq(cards.id, id))
    .limit(1);
  if (!row) return NextResponse.json({ error: "Card not found" }, { status: 404 });

  return NextResponse.json({
    card: row.card,
    ownerName: row.ownerName,
    sighting: {
      id: row.sighting.id,
      timestamp: row.sighting.timestamp,
      detectedSpeciesLabel: row.sighting.detectedSpeciesLabel,
      isSensitiveSpecies: row.sighting.isSensitiveSpecies,
      verificationStatus: row.sighting.verificationStatus,
      linkedFromSightingId: row.sighting.linkedFromSightingId,
      hasLocation: row.sighting.geoLat != null,
    },
  });
}

export async function DELETE(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getOrCreateUser();
  await db.delete(cards).where(and(eq(cards.id, id), eq(cards.ownerUserId, user.id)));
  return NextResponse.json({ ok: true });
}
