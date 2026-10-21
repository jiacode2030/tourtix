import { computeStatus } from "./status";
import type { Artist, Presale, Show } from "./types";

const BASE = "https://app.ticketmaster.com/discovery/v2";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function tm(path: string, params: Record<string, string>) {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) throw new Error("TICKETMASTER_API_KEY is not set");
  const qs = new URLSearchParams({ ...params, apikey: key });
  const res = await fetch(`${BASE}${path}?${qs}`, {
    next: { revalidate: 900 },
  });
  if (!res.ok) throw new Error(`Ticketmaster ${res.status}: ${path}`);
  return res.json();
}

function pickImage(images: any[] | undefined): string | null {
  if (!images?.length) return null;
  const wide = images
    .filter((i) => i.ratio === "16_9")
    .sort((a, b) => b.width - a.width);
  return (wide[0] ?? images[0]).url ?? null;
}

function toArtist(a: any): Artist {
  return {
    id: a.id,
    name: a.name,
    imageUrl: pickImage(a.images),
    genre: a.classifications?.[0]?.genre?.name ?? null,
    upcomingShows: a.upcomingEvents?._total ?? 0,
  };
}

function toShow(e: any): Show {
  const venue = e._embedded?.venues?.[0];
  const presales: Presale[] = (e.sales?.presales ?? []).map((p: any) => ({
    name: p.name ?? "Presale",
    start: p.startDateTime ?? null,
    end: p.endDateTime ?? null,
  }));
  const publicSaleStart = e.sales?.public?.startTBD
    ? null
    : (e.sales?.public?.startDateTime ?? null);
  const price = e.priceRanges?.[0];
  return {
    id: e.id,
    name: e.name,
    date: e.dates?.start?.localDate ?? null,
    time: e.dates?.start?.localTime ?? null,
    timezone: e.dates?.timezone ?? venue?.timezone ?? null,
    venue: venue?.name ?? null,
    city: venue?.city?.name ?? null,
    region: venue?.state?.stateCode ?? null,
    country: venue?.country?.countryCode ?? null,
    url: e.url ?? null,
    status: computeStatus(e.dates?.status?.code, publicSaleStart, presales),
    publicSaleStart,
    presales,
    priceMin: price?.min ?? null,
    priceMax: price?.max ?? null,
    currency: price?.currency ?? null,
  };
}

export async function tmSearchArtists(query: string): Promise<Artist[]> {
  const data = await tm("/attractions.json", {
    keyword: query,
    classificationName: "music",
    size: "20",
  });
  return (data._embedded?.attractions ?? []).map(toArtist);
}

export async function tmGetArtist(id: string): Promise<Artist | null> {
  try {
    return toArtist(await tm(`/attractions/${id}.json`, {}));
  } catch {
    return null;
  }
}

export async function tmGetShows(artistId: string): Promise<Show[]> {
  const data = await tm("/events.json", {
    attractionId: artistId,
    sort: "date,asc",
    size: "100",
  });
  return (data._embedded?.events ?? []).map(toShow);
}
