import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/session";
import { grantCans, syncCans } from "@/lib/economy";
import { buildMePayload } from "@/lib/payload";

export const dynamic = "force-dynamic";

/** Rewarded-ad grant (AdMob in production). Server caps the overflow. */
export async function POST() {
  const user = await getOrCreateUser();
  const state = await syncCans(user.id, user.isPremiumActive);
  if (state.current >= state.max + 2) {
    return NextResponse.json({ error: "Your can stash is already overflowing." }, { status: 429 });
  }
  await grantCans(user.id, 1, user.isPremiumActive);
  return NextResponse.json({ me: await buildMePayload(user) });
}
