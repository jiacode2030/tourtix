import { computeStatus } from "./status";
import type { Artist, Presale, Show } from "./types";

const BASE = "https://app.ticketmaster.com/discovery/v2";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function tm(path: string, params: Record<string, string>) {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) throw new Error("TICKETMASTER_API_KEY is not set");
  const qs = new URLSearchParams({ ...params, apikey: key });
  const res = await fetch(`${BASE}${path}?${qs}`, {
    next: { revalidate: 300 },
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
  // Discovery price ranges are usually face value before fees; only use one
  // that says it includes fees.
  const allIn = (e.priceRanges ?? []).find((r: any) => /fee/i.test(r.type ?? ""));
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
    links: e.url
      ? [
          {
            seller: "Ticketmaster",
            url: e.url,
            allInPrice: allIn?.min ?? null,
            currency: allIn?.currency ?? null,
          },
        ]
      : [],
    status: computeStatus(e.dates?.status?.code, publicSaleStart, presales),
    publicSaleStart,
    presales,
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

// Ticketmaster wants UTC timestamps without milliseconds.
const tmTime = (ms: number) => new Date(ms).toISOString().slice(0, 19) + "Z";

type EventWithArtist = { artist: Artist; show: Show };

function withArtists(data: any): EventWithArtist[] {
  return (data._embedded?.events ?? []).flatMap((e: any) => {
    const a = e._embedded?.attractions?.[0];
    return a ? [{ artist: toArtist(a), show: toShow(e) }] : [];
  });
}

// Most relevant upcoming US music events, reduced to unique artists.
export async function tmPopularArtists(limit: number): Promise<Artist[]> {
  const data = await tm("/events.json", {
    classificationName: "music",
    countryCode: "US",
    sort: "relevance,desc",
    size: "100",
  });
  const seen = new Map<string, Artist>();
  for (const { artist } of withArtists(data)) {
    if (!seen.has(artist.id)) seen.set(artist.id, artist);
  }
  return [...seen.values()].slice(0, limit);
}

// US music events whose public sale starts within the window.
export async function tmEventsGoingOnSale(windowMs: number): Promise<EventWithArtist[]> {
  const now = Date.now();
  const data = await tm("/events.json", {
    classificationName: "music",
    countryCode: "US",
    onsaleStartDateTime: tmTime(now),
    onsaleEndDateTime: tmTime(now + windowMs),
    sort: "relevance,desc",
    size: "100",
  });
  return withArtists(data);
}
