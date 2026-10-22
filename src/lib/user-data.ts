import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { favorites, profiles, pushSubscriptions, stamps } from "@/db/schema";
import { DEFAULT_RADIUS, type UserLocation } from "./geo";
import type { Stamp } from "./passport";

export type Profile = typeof profiles.$inferSelect;

export async function getProfile(userId: string): Promise<Profile | null> {
  const rows = await db().select().from(profiles).where(eq(profiles.userId, userId));
  return rows[0] ?? null;
}

// A user's own passport stamps, newest concert first. Never call this with
// anyone's id but the signed-in user's: stamps are private.
export async function listStamps(userId: string): Promise<Stamp[]> {
  return db()
    .select({
      id: stamps.id,
      artistId: stamps.artistId,
      artistName: stamps.artistName,
      imageUrl: stamps.imageUrl,
      venue: stamps.venue,
      city: stamps.city,
      eventDate: stamps.eventDate,
    })
    .from(stamps)
    .where(eq(stamps.userId, userId))
    .orderBy(desc(stamps.eventDate), desc(stamps.id));
}

export async function hasStamps(userId: string): Promise<boolean> {
  const rows = await db().select({ id: stamps.id }).from(stamps).where(eq(stamps.userId, userId)).limit(1);
  return rows.length > 0;
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

// Whether the user turned on notifications on at least one device.
export async function hasNotifications(userId: string) {
  const rows = await db()
    .select({ endpoint: pushSubscriptions.endpoint })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.userId, userId))
    .limit(1);
  return rows.length > 0;
}
