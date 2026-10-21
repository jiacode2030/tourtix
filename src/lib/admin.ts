import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { appState } from "@/db/schema";

// The site owner is whoever signs in with the Google account whose email is
// in the ADMIN_EMAIL environment variable (set in Vercel, not in code).
export async function currentAdminId(): Promise<string | null> {
  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!admin) return null;
  const session = await auth();
  const email = session?.user?.email?.toLowerCase();
  const id = session?.user?.id;
  if (!id || email !== admin) return null;
  // Remember the owner's user ID so contact messages can notify their devices.
  await db()
    .insert(appState)
    .values({ key: "admin_user_id", value: id })
    .onConflictDoUpdate({ target: appState.key, set: { value: id } });
  return id;
}

export async function adminUserId(): Promise<string | null> {
  const rows = await db().select().from(appState).where(eq(appState.key, "admin_user_id"));
  return rows[0]?.value ?? null;
}
