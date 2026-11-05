import { STORE_CATALOG } from "./store-catalog";
export { STORE_CATALOG };
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { cards, sightings, storeItems, users } from "@/db/schema";
import { RARITY_META, SPECIES, type TaxonCategory } from "./game-data";
import { generateCard } from "./card-gen";
import { nextSerial } from "./serial";
import { getSpecimenDataUri } from "./specimen-art";

export function doodlePhoto(taxon: TaxonCategory, _tint?: string) {
  return getSpecimenDataUri(taxon, null, "tier2");
}

const DEMO_USERS = [
  { username: "MossyRambler", avatarSeed: "hedgehog" },
  { username: "PigeonPost", avatarSeed: "bird" },
  { username: "FernAndFlask", avatarSeed: "frog" },
];



export async function ensureStore() {
  for (const item of STORE_CATALOG) {
    await db
      .insert(storeItems)
      .values({ ...item, payload: item.payload as Record<string, unknown> })
      .onConflictDoNothing();
  }
}

/** Creates a handful of community sightings near the viewer so the map is alive. */
export async function ensureNearbyDemoData(lat: number, lng: number) {
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sightings)
    .innerJoin(users, eq(users.id, sightings.userId))
    .where(
      and(
        eq(users.isDemo, true),
        sql`abs(${sightings.geoLat} - ${lat}) < 0.06 and abs(${sightings.geoLng} - ${lng}) < 0.06`,
      ),
    );
  if (count >= 8) return;

  const demoIds: string[] = [];
  for (const demo of DEMO_USERS) {
    const existing = await db.select().from(users).where(eq(users.username, demo.username)).limit(1);
    if (existing[0]) {
      demoIds.push(existing[0].id);
      continue;
    }
    const [created] = await db
      .insert(users)
      .values({ ...demo, isDemo: true, xp: 900 + Math.floor(Math.random() * 2000), coins: 300 })
      .returning();
    demoIds.push(created.id);
  }

  for (let i = 0; i < 10; i += 1) {
    const species = SPECIES[Math.floor(Math.random() * SPECIES.length)];
    const owner = demoIds[i % demoIds.length];
    const photo = doodlePhoto(species.taxon, "#cfe0c3");
    const [sighting] = await db
      .insert(sightings)
      .values({
        userId: owner,
        photoUrl: photo,
        thumbnailUrl: photo,
        phash: `demo-${Math.random().toString(36).slice(2, 12)}`,
        detectedTaxonCategory: species.taxon,
        detectedSpeciesLabel: species.label,
        geoLat: lat + (Math.random() - 0.5) * 0.02,
        geoLng: lng + (Math.random() - 0.5) * 0.02,
        isSensitiveSpecies: Boolean(species.sensitive),
        verificationStatus: species.sensitive ? "pending" : "verified",
      })
      .returning();

    const generated = generateCard(species.taxon, species.label);
    await db.insert(cards).values({
      sightingId: sighting.id,
      ownerUserId: owner,
      generatedName: generated.generatedName,
      serialNumber: await nextSerial(generated.rarityTier),
      taxonCategory: generated.taxonCategory,
      speciesLabel: species.label,
      rarityTier: generated.rarityTier,
      statA: generated.statA,
      statB: generated.statB,
      statC: generated.statC,
      statCLabel: generated.statCLabel,
      typeLabel: generated.typeLabel,
      abilities: generated.abilities,
      photoUrl: photo,
      xpAwarded: RARITY_META[generated.rarityTier].xp,
      coinsAwarded: RARITY_META[generated.rarityTier].coins,
    });
  }
}
