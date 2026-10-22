import type { MetadataRoute } from "next";
import { db } from "@/db";
import { favorites } from "@/db/schema";
import { popularArtists } from "@/lib/data";
import { siteUrl } from "@/lib/site";

export const revalidate = 86400; // rebuild daily

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const pages = ["", "/concerts", "/tips", "/faq", "/help/notifications", "/contact", "/privacy", "/terms"].map(
    (path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const }),
  );

  // Artist pages: popular artists plus any artist someone follows.
  const ids = new Set((await popularArtists(40)).map((a) => a.id));
  try {
    const followed = await db().selectDistinct({ id: favorites.artistId }).from(favorites);
    followed.forEach((f) => ids.add(f.id));
  } catch (err) {
    console.error(err);
  }
  const artists = [...ids].map((id) => ({
    url: `${base}/artists/${id}`,
    changeFrequency: "daily" as const,
  }));
  return [...pages, ...artists];
}
