import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { cards } from "@/db/schema";
import { getOrCreateUser } from "@/lib/session";
import { SPECIES, TAXA, type TaxonCategory } from "@/lib/game-data";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getOrCreateUser();
  const owned = await db
    .select({ species: cards.speciesLabel, taxon: cards.taxonCategory })
    .from(cards)
    .where(eq(cards.ownerUserId, user.id));
  const found = new Set(owned.map((o) => o.species).filter(Boolean) as string[]);

  const categories = TAXA.map((taxon: TaxonCategory) => {
    const list = SPECIES.filter((s) => s.taxon === taxon);
    return {
      taxon,
      total: list.length,
      found: list.filter((s) => found.has(s.label)).length,
      species: list.map((s) => ({
        label: s.label,
        commonness: s.commonness,
        sensitive: Boolean(s.sensitive),
        found: found.has(s.label),
      })),
    };
  });

  return NextResponse.json({ categories });
}
