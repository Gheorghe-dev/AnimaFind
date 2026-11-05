import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { storeItems, users } from "@/db/schema";
import { getOrCreateUser } from "@/lib/session";
import { ensureStore } from "@/lib/seed";
import { grantCans } from "@/lib/economy";
import { buildMePayload } from "@/lib/payload";

export const dynamic = "force-dynamic";

export async function GET() {
  await ensureStore();
  const user = await getOrCreateUser();
  const items = await db.select().from(storeItems);
  return NextResponse.json({ items, me: await buildMePayload(user) });
}

export async function POST(request: Request) {
  await ensureStore();
  const user = await getOrCreateUser();
  const { itemId } = (await request.json()) as { itemId?: string };
  if (!itemId) return NextResponse.json({ error: "itemId required" }, { status: 400 });

  const [item] = await db.select().from(storeItems).where(eq(storeItems.id, itemId)).limit(1);
  if (!item) return NextResponse.json({ error: "Unknown item." }, { status: 404 });

  if (item.kind === "subscription") {
    // In production this is a RevenueCat entitlement webhook; here we simulate it.
    const [updated] = await db
      .update(users)
      .set({ isPremiumActive: !user.isPremiumActive })
      .where(eq(users.id, user.id))
      .returning();
    return NextResponse.json({ me: await buildMePayload(updated), message: updated.isPremiumActive ? "premium-on" : "premium-off" });
  }

  if (user.coins < item.price) {
    return NextResponse.json({ error: "Not enough coins." }, { status: 402 });
  }

  const payload = item.payload as { cans?: number; cosmetic?: string };
  const owned = [...user.ownedCosmetics];
  if (payload.cosmetic) {
    if (owned.includes(payload.cosmetic)) {
      return NextResponse.json({ error: "Already owned." }, { status: 409 });
    }
    owned.push(payload.cosmetic);
  }

  const [updated] = await db
    .update(users)
    .set({ coins: user.coins - item.price, ownedCosmetics: owned })
    .where(eq(users.id, user.id))
    .returning();

  if (payload.cans) await grantCans(user.id, payload.cans, updated.isPremiumActive);

  return NextResponse.json({ me: await buildMePayload(updated), message: "purchased" });
}
