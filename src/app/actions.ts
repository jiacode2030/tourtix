"use server";

import { currentUserId, signOut } from "@/auth";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { contactMessages, favorites, profiles, pushSubscriptions, sentAlerts } from "@/db/schema";
import { getArtist } from "@/lib/data";
import { DEFAULT_RADIUS, RADIUS_OPTIONS } from "@/lib/geo";
import { sendToUser } from "@/lib/push";
import { isUsState } from "@/lib/regions";
import { isZip, lookupZip } from "@/lib/zip";

async function requireUser() {
  const userId = await currentUserId();
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
  revalidatePath("/");
}

// Saves the user's location from a ZIP code, the browser's location, or
// clears it. The distance setting is saved every time.
export async function saveLocation(formData: FormData) {
  const userId = await requireUser();
  const mode = String(formData.get("mode") ?? "zip");
  const radius = Number(formData.get("radius"));
  const radiusMiles = RADIUS_OPTIONS.includes(radius) ? radius : DEFAULT_RADIUS;
  // Round to 2 decimals (~1 km) so we never store an exact location.
  const round = (n: number) => Math.round(n * 100) / 100;

  type Location = { zip: string | null; city: string | null; region: string | null; lat: number | null; lng: number | null };
  let location: Location | null = null; // null = keep the current location
  if (mode === "clear") {
    location = { zip: null, city: null, region: null, lat: null, lng: null };
  } else if (mode === "here") {
    const lat = Number(formData.get("lat"));
    const lng = Number(formData.get("lng"));
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      redirect("/settings?error=here#location");
    }
    location = { zip: null, city: null, region: null, lat: round(lat), lng: round(lng) };
  } else {
    const zip = String(formData.get("zip") ?? "").trim();
    if (zip) {
      if (!isZip(zip)) redirect("/settings?error=zip#location");
      let place: Awaited<ReturnType<typeof lookupZip>>;
      try {
        place = await lookupZip(zip);
      } catch (err) {
        console.error(err);
        redirect("/settings?error=zipservice#location");
      }
      if (!place) redirect("/settings?error=zip#location");
      location = { zip, city: place.city, region: isUsState(place.region) ? place.region : null, lat: round(place.lat), lng: round(place.lng) };
    }
  }

  const values = { radiusMiles, ...(location ?? {}) };
  await db()
    .insert(profiles)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: profiles.userId, set: { ...values, updatedAt: new Date() } });
  revalidatePath("/settings");
  revalidatePath("/my-artists");
  redirect("/settings?saved=1#location");
}

// Deletes everything we store about the user and signs them out. Accounts
// are just a Google sign-in, so there's no separate login record to remove.
export async function deleteMyAccount() {
  const userId = await requireUser();
  await db().delete(favorites).where(eq(favorites.userId, userId));
  await db().delete(profiles).where(eq(profiles.userId, userId));
  await db().delete(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
  await db().delete(sentAlerts).where(eq(sentAlerts.userId, userId));
  await db().delete(contactMessages).where(eq(contactMessages.userId, userId));
  await signOut({ redirectTo: "/?deleted=1" });
}

export async function saveAlertPrefs(formData: FormData) {
  const userId = await requireUser();
  const prefs = {
    alertNewShows: formData.get("newShows") === "on",
    alertSales: formData.get("sales") === "on",
    alertNearOnly: formData.get("nearOnly") === "on",
  };
  await db()
    .insert(profiles)
    .values({ userId, ...prefs })
    .onConflictDoUpdate({ target: profiles.userId, set: { ...prefs, updatedAt: new Date() } });
  revalidatePath("/settings");
  redirect("/settings?saved=alerts");
}

type BrowserSubscription = { endpoint?: string; keys?: { p256dh?: string; auth?: string } };

// Browsers' push services. Only these are accepted, so nobody can make the
// alert job send requests to arbitrary servers.
const PUSH_HOST_SUFFIXES = [
  "fcm.googleapis.com",
  "push.services.mozilla.com",
  "push.apple.com",
  "notify.windows.com",
];

function isPushServiceUrl(endpoint: string) {
  try {
    const url = new URL(endpoint);
    return (
      url.protocol === "https:" &&
      PUSH_HOST_SUFFIXES.some((h) => url.hostname === h || url.hostname.endsWith(`.${h}`))
    );
  } catch {
    return false;
  }
}

export async function savePushSubscription(sub: BrowserSubscription) {
  const userId = await requireUser();
  const { endpoint, keys } = sub;
  if (!endpoint || !isPushServiceUrl(endpoint) || !keys?.p256dh || !keys?.auth) {
    throw new Error("Invalid subscription");
  }
  await db()
    .insert(pushSubscriptions)
    .values({ endpoint, userId, p256dh: keys.p256dh, auth: keys.auth })
    .onConflictDoUpdate({
      target: pushSubscriptions.endpoint,
      set: { userId, p256dh: keys.p256dh, auth: keys.auth },
    });
}

export async function removePushSubscription(endpoint: string) {
  const userId = await requireUser();
  await db()
    .delete(pushSubscriptions)
    .where(and(eq(pushSubscriptions.endpoint, endpoint), eq(pushSubscriptions.userId, userId)));
}

export async function sendTestNotification() {
  const userId = await requireUser();
  return sendToUser(userId, {
    title: "TourTix notifications are on",
    body: "You'll get alerts here when your artists announce shows or tickets go on sale.",
    url: "/my-artists",
    tag: `test-${Date.now()}`,
  });
}
