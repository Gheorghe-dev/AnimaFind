import { NextResponse } from "next/server";
import { and, eq, or } from "drizzle-orm";
import { db } from "@/db";
import { cards, friendships, notifications, rounds, sightings } from "@/db/schema";
import { getOrCreateUser } from "@/lib/session";
import { awardProgress, logScanEvent } from "@/lib/economy";
import { generateCard, speciesInfo } from "@/lib/card-gen";
import { nextSerial } from "@/lib/serial";
import { RARITY_META, TAXA, type TaxonCategory } from "@/lib/game-data";
import { buildMePayload } from "@/lib/payload";
import { haversineMeters, PROXIMITY_METERS } from "@/lib/geo";

export const dynamic = "force-dynamic";

function hamming(a: string, b: string) {
  if (a.length !== b.length) return 99;
  let d = 0;
  for (let i = 0; i < a.length; i += 1) {
    const x = parseInt(a[i], 16) ^ parseInt(b[i], 16);
    d += (x.toString(2).match(/1/g) || []).length;
  }
  return d;
}

export async function POST(request: Request) {
  const user = await getOrCreateUser();
  if (!user.gdprConsentAt) return NextResponse.json({ error: "Consent required." }, { status: 403 });

  const body = (await request.json()) as {
    roundId?: string;
    photo?: string;
    phash?: string;
    taxon?: TaxonCategory;
    species?: string | null;
    lat?: number | null;
    lng?: number | null;
    motionScore?: number;
    screenScore?: number;
    linkedFromSightingId?: string | null;
  };

  if (!body.roundId || !body.photo || !body.taxon || !TAXA.includes(body.taxon)) {
    return NextResponse.json({ error: "Malformed sighting payload." }, { status: 400 });
  }

  const [round] = await db
    .select()
    .from(rounds)
    .where(and(eq(rounds.id, body.roundId), eq(rounds.userId, user.id)))
    .limit(1);
  if (!round || round.status === "completed") {
    return NextResponse.json({ error: "This round was already redeemed." }, { status: 409 });
  }
  if (Date.now() - new Date(round.createdAt).getTime() > 15 * 60_000) {
    return NextResponse.json({ error: "Round expired — start a new one." }, { status: 409 });
  }

  // --- anti-cheat: re-validate the on-device signals server side ---
  if ((body.motionScore ?? 0) < 0.02) {
    return NextResponse.json(
      { error: "No parallax detected — the scan looked like a static image. Move slightly while scanning." },
      { status: 422 },
    );
  }
  if ((body.screenScore ?? 0) > 0.72) {
    return NextResponse.json(
      { error: "Screen-capture pattern detected (moiré). Please scan a real animal." },
      { status: 422 },
    );
  }

  if (body.phash) {
    const previous = await db.select({ phash: sightings.phash }).from(sightings);
    const dup = previous.some((p) => p.phash && hamming(p.phash, body.phash!) <= 5);
    if (dup) {
      return NextResponse.json(
        { error: "This photo (or a near-identical one) has already been logged." },
        { status: 409 },
      );
    }
  }

  // --- linked map card requires physical proximity to the original pin ---
  let linkedFrom: string | null = null;
  if (body.linkedFromSightingId) {
    const [source] = await db
      .select()
      .from(sightings)
      .where(eq(sightings.id, body.linkedFromSightingId))
      .limit(1);
    if (!source) return NextResponse.json({ error: "Unknown pin." }, { status: 404 });
    if (body.lat == null || body.lng == null || source.geoLat == null || source.geoLng == null) {
      return NextResponse.json({ error: "Location needed to claim a pin." }, { status: 400 });
    }
    const distance = haversineMeters(body.lat, body.lng, source.geoLat, source.geoLng);
    if (distance > PROXIMITY_METERS) {
      return NextResponse.json(
        { error: `You are ${Math.round(distance)} m away — get within ${PROXIMITY_METERS} m of the pin.` },
        { status: 403 },
      );
    }
    linkedFrom = source.id;
  }

  const info = speciesInfo(body.species);
  const sensitive = Boolean(info?.sensitive);
  const photo = body.photo.slice(0, 900_000);

  const [sighting] = await db
    .insert(sightings)
    .values({
      userId: user.id,
      photoUrl: photo,
      thumbnailUrl: photo,
      phash: body.phash ?? null,
      detectedTaxonCategory: body.taxon,
      detectedSpeciesLabel: body.species ?? null,
      geoLat: user.locationConsent ? (body.lat ?? null) : null,
      geoLng: user.locationConsent ? (body.lng ?? null) : null,
      isSensitiveSpecies: sensitive,
      // protected species wait for manual review before they can appear publicly
      verificationStatus: sensitive ? "pending" : "verified",
      linkedFromSightingId: linkedFrom,
    })
    .returning();

  const generated = generateCard(body.taxon, body.species);
  const serialNumber = await nextSerial(generated.rarityTier);
  const [card] = await db
    .insert(cards)
    .values({
      sightingId: sighting.id,
      ownerUserId: user.id,
      generatedName: generated.generatedName,
      serialNumber,
      taxonCategory: generated.taxonCategory,
      speciesLabel: body.species ?? null,
      rarityTier: generated.rarityTier,
      statA: generated.statA,
      statB: generated.statB,
      statC: generated.statC,
      statCLabel: generated.statCLabel,
      typeLabel: generated.typeLabel,
      abilities: generated.abilities,
      photoUrl: photo,
      xpAwarded: generated.xpAwarded,
      coinsAwarded: generated.coinsAwarded,
    })
    .returning();

  await db.update(rounds).set({ status: "completed" }).where(eq(rounds.id, round.id));
  await logScanEvent(user.id);
  const updatedUser = await awardProgress(user.id, generated.xpAwarded, generated.coinsAwarded);

  if (RARITY_META[generated.rarityTier].rank >= 4) {
    const friends = await db
      .select()
      .from(friendships)
      .where(
        and(
          eq(friendships.status, "accepted"),
          or(eq(friendships.userId, user.id), eq(friendships.friendId, user.id)),
        ),
      );
    for (const f of friends) {
      const other = f.userId === user.id ? f.friendId : f.userId;
      await db.insert(notifications).values({
        userId: other,
        kind: "rare",
        title: `${user.username} found something rare!`,
        body: `${generated.generatedName} — ${RARITY_META[generated.rarityTier].name} ${generated.taxonCategory}.`,
      });
    }
  }

  return NextResponse.json({
    card,
    sighting: { id: sighting.id, isSensitiveSpecies: sensitive, verificationStatus: sighting.verificationStatus },
    me: await buildMePayload(updatedUser),
  });
}
