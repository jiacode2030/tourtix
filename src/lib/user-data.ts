import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { favorites, profiles } from "@/db/schema";
import { DEFAULT_RADIUS, type UserLocation } from "./geo";

export type Profile = typeof profiles.$inferSelect;

export async function getProfile(userId: string): Promise<Profile | null> {
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

export function locationOf(profile: Profile | null): UserLocation | null {
  if (!profile) return null;
  return {
    region: profile.region,
    lat: profile.lat,
    lng: profile.lng,
    radiusMiles: profile.radiusMiles ?? DEFAULT_RADIUS,
  };
}
