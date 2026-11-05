import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { getOrCreateUser } from "@/lib/session";
import { buildMePayload } from "@/lib/payload";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await getOrCreateUser();
  const body = (await request.json()) as {
    gdprConsent?: boolean;
    ageConfirmed?: boolean;
    locationConsent?: boolean;
    username?: string;
  };

  if (!body.gdprConsent || !body.ageConfirmed) {
    return NextResponse.json(
      { error: "Consent and the 16+ age confirmation are both required to continue." },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(users)
    .set({
      gdprConsentAt: new Date(),
      ageConfirmed: true,
      locationConsent: Boolean(body.locationConsent),
      username: body.username?.trim() ? body.username.trim().slice(0, 24) : user.username,
    })
    .where(eq(users.id, user.id))
    .returning();

  return NextResponse.json(await buildMePayload(updated));
}
