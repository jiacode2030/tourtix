import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { favorites, profiles } from "@/db/schema";

export async function getProfile(userId: string) {
  const rows = await db().select().from(profiles).where(eq(profiles.userId, userId));
  return rows[0] ?? null;
}

export async function listFavorites(userId: string) {
  return db()
    .select()
    .from(favorites)
    .where(eq(favorites.userId, userId))
    .orderBy(desc(favorites.createdAt));
}

export async function isFavorite(userId: string, artistId: string) {
  const rows = await db()
    .select({ artistId: favorites.artistId })
    .from(favorites)
    .where(and(eq(favorites.userId, userId), eq(favorites.artistId, artistId)));
  return rows.length > 0;
}
