"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { favorites, profiles } from "@/db/schema";
import { getArtist } from "@/lib/data";
import { isUsState } from "@/lib/regions";

async function requireUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  return userId;
}

export async function toggleFavorite(artistId: string, currentlyFavorite: boolean) {
  const userId = await requireUser();
  if (currentlyFavorite) {
    await db()
      .delete(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.artistId, artistId)));
  } else {
    // Look the artist up server-side rather than trusting names sent by the browser.
    const artist = await getArtist(artistId);
    if (!artist) throw new Error("Unknown artist");
    await db()
      .insert(favorites)
      .values({ userId, artistId, artistName: artist.name, imageUrl: artist.imageUrl })
      .onConflictDoNothing();
  }
  revalidatePath(`/artists/${artistId}`);
  revalidatePath("/my-artists");
}

export async function saveLocation(formData: FormData) {
  const userId = await requireUser();
  const city = String(formData.get("city") ?? "").trim().slice(0, 100) || null;
  const rawRegion = String(formData.get("region") ?? "");
  const region = isUsState(rawRegion) ? rawRegion : null;
  await db()
    .insert(profiles)
    .values({ userId, city, region })
    .onConflictDoUpdate({
      target: profiles.userId,
      set: { city, region, updatedAt: new Date() },
    });
  revalidatePath("/settings");
  revalidatePath("/my-artists");
  redirect("/settings?saved=1");
}

// Deletes everything we store about the user, then their login account.
export async function deleteMyAccount() {
  const userId = await requireUser();
  await db().delete(favorites).where(eq(favorites.userId, userId));
  await db().delete(profiles).where(eq(profiles.userId, userId));
  const clerk = await clerkClient();
  await clerk.users.deleteUser(userId);
  redirect("/?deleted=1");
}
