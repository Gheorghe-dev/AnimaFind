import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { resourceBalances, users } from "@/db/schema";

export const SESSION_COOKIE = "cc_uid";

/** Postgres `uuid` columns reject anything that is not a UUID — a corrupt or
 *  tampered cookie must not blow up every route with a 500. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ADJ = ["Mossy", "Brisk", "Amber", "Quiet", "Wandering", "Copper", "Dappled"];
const NOUN = ["Naturalist", "Rambler", "Fieldmouse", "Lichen", "Sketchbook", "Bramble"];

export type SessionUser = typeof users.$inferSelect;

export async function getSessionUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const id = jar.get(SESSION_COOKIE)?.value;
  if (!id || !UUID_RE.test(id)) return null;
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0] ?? null;
}

/** Reads the session cookie, creating a fresh local profile the first time. */
export async function getOrCreateUser(): Promise<SessionUser> {
  const existing = await getSessionUser();
  if (existing) return existing;

  const username = `${ADJ[Math.floor(Math.random() * ADJ.length)]}${
    NOUN[Math.floor(Math.random() * NOUN.length)]
  }${Math.floor(Math.random() * 900 + 100)}`;

  const [created] = await db.insert(users).values({ username }).returning();
  await db.insert(resourceBalances).values({ userId: created.id }).onConflictDoNothing();

  const jar = await cookies();
  jar.set(SESSION_COOKIE, created.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return created;
}
