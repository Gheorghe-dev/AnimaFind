import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/session";
import { buildMePayload } from "@/lib/payload";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getOrCreateUser();
  return NextResponse.json(await buildMePayload(user));
}
