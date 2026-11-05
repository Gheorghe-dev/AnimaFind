import { NextResponse } from "next/server";
import { and, desc, eq, isNotNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { cards, sightings, users } from "@/db/schema";
import { getOrCreateUser } from "@/lib/session";
import { ensureNearbyDemoData } from "@/lib/seed";
import { fuzzCoords, haversineMeters, PROXIMITY_METERS } from "@/lib/geo";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const user = await getOrCreateUser();
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  const hasViewer = Number.isFinite(lat) && Number.isFinite(lng);

  if (hasViewer) await ensureNearbyDemoData(lat, lng);

  const rows = await db
    .select({
      sighting: sightings,
      username: users.username,
      cardName: cards.generatedName,
      tier: cards.rarityTier,
    })
    .from(sightings)
    .innerJoin(users, eq(users.id, sightings.userId))
    .leftJoin(cards, eq(cards.sightingId, sightings.id))
    .where(
      and(
        eq(sightings.verificationStatus, "verified"),
        eq(sightings.isPublic, true),
        isNotNull(sightings.geoLat),
        hasViewer
          ? sql`abs(${sightings.geoLat} - ${lat}) < 0.35 and abs(${sightings.geoLng} - ${lng}) < 0.35`
          : sql`true`,
      ),
    )
    .orderBy(desc(sightings.timestamp))
    .limit(60);

  const claimed = new Set(
    (
      await db
        .select({ src: sightings.linkedFromSightingId })
        .from(sightings)
        .where(and(eq(sightings.userId, user.id), isNotNull(sightings.linkedFromSightingId)))
    ).map((r) => r.src),
  );

  const pins = rows.map((r) => {
    const s = r.sighting;
    const fuzzed = fuzzCoords(s.geoLat!, s.geoLng!, s.isSensitiveSpecies, s.id);
    const distance = hasViewer ? haversineMeters(lat, lng, s.geoLat!, s.geoLng!) : null;
    return {
      sightingId: s.id,
      approxLat: fuzzed.lat,
      approxLng: fuzzed.lng,
      precision: s.isSensitiveSpecies ? "5 km area" : "150 m area",
      thumbnailUrl: s.thumbnailUrl ?? s.photoUrl,
      taxon: s.detectedTaxonCategory,
      species: s.isSensitiveSpecies ? "Protected species (hidden)" : s.detectedSpeciesLabel,
      isSensitiveSpecies: s.isSensitiveSpecies,
      byUsername: r.username,
      cardName: r.cardName,
      tier: r.tier,
      timestamp: s.timestamp,
      distanceMeters: distance == null ? null : Math.round(distance),
      isClaimableByViewer:
        distance != null &&
        distance <= PROXIMITY_METERS &&
        s.userId !== user.id &&
        !claimed.has(s.id),
      alreadyClaimed: claimed.has(s.id),
      isOwn: s.userId === user.id,
    };
  });

  return NextResponse.json({ pins, proximityMeters: PROXIMITY_METERS });
}
