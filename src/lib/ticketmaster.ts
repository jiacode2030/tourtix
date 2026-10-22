import { apiFetch } from "./http";
import { presaleDisplayName } from "./presale-names";
import { computeStatus } from "./status";
import type { Artist, Presale, Show, ShowExtras } from "./types";

const BASE = "https://app.ticketmaster.com/discovery/v2";

// Ticketmaster's segment ID for Music.
const MUSIC_SEGMENT = "KZFzniwnSyZfZ7v7nJ";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function tm(path: string, params: Record<string, string>) {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) throw new Error("TICKETMASTER_API_KEY is not set");
  const qs = new URLSearchParams({ ...params, apikey: key });
  return apiFetch(`${BASE}${path}?${qs}`, 300, `Ticketmaster ${path}`);
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

// Ticketmaster uses dates like 1900-01-01 as "to be announced" placeholders.
function realTime(iso: unknown): string | null {
  if (typeof iso !== "string") return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) && new Date(t).getUTCFullYear() >= 2000 ? iso : null;
}

function toShow(e: any): Show {
  const venue = e._embedded?.venues?.[0];
  const presales: Presale[] = (e.sales?.presales ?? []).map((p: any) => ({
    name: presaleDisplayName(p.name ?? "Presale"),
    start: realTime(p.startDateTime),
    end: realTime(p.endDateTime),
    url: p.url ?? null,
    description: p.description ?? null,
  }));
  const publicSaleStart = e.sales?.public?.startTBD ? null : realTime(e.sales?.public?.startDateTime);
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
    lat: num(venue?.location?.latitude),
    lng: num(venue?.location?.longitude),
    extras: tmExtras(e, venue),
  };
}

function num(v: unknown): number | null {
  const n = Number(v);
  return v != null && Number.isFinite(n) ? n : null;
}

const text = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);

function tmExtras(e: any, venue: any): ShowExtras {
  return {
    seatmapUrl: text(e.seatmap?.staticUrl),
    ticketLimit: text(e.ticketLimit?.info),
    ageRestriction: e.ageRestrictions?.legalAgeEnforced
      ? "Age restrictions apply (legal age enforced)."
      : undefined,
    accessibility: text(e.accessibility?.info) ?? text(venue?.accessibleSeatingDetail),
    pleaseNote: text(e.pleaseNote) ?? text(e.info),
    parking: text(venue?.parkingDetail),
  };
}

export const _test = { toShow };

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
  } catch (err) {
    if (String(err).endsWith(" 404")) return null;
    throw err;
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

// Music filter for event searches: all music, or one genre within music.
function musicFilter(genre?: string): Record<string, string> {
  return genre ? { segmentId: MUSIC_SEGMENT, classificationName: genre } : { classificationName: "music" };
}

export type ArtistWithShows = { artist: Artist; shows: Show[] };

// Most relevant upcoming US music events, grouped into unique artists with
// the shows from that same response (so callers can find each artist's next
// sale without extra API calls).
export async function tmPopularArtists(limit: number, genre?: string): Promise<ArtistWithShows[]> {
  const data = await tm("/events.json", {
    ...musicFilter(genre),
    countryCode: "US",
    sort: "relevance,desc",
    size: "100",
  });
  const byArtist = new Map<string, ArtistWithShows>();
  for (const { artist, show } of withArtists(data)) {
    const entry = byArtist.get(artist.id) ?? { artist, shows: [] };
    entry.shows.push(show);
    byArtist.set(artist.id, entry);
  }
  return [...byArtist.values()].slice(0, limit);
}

// US music events whose public sale starts within the window.
export async function tmEventsGoingOnSale(windowMs: number, genre?: string): Promise<EventWithArtist[]> {
  const now = Date.now();
  const data = await tm("/events.json", {
    ...musicFilter(genre),
    countryCode: "US",
    onsaleStartDateTime: tmTime(now),
    onsaleEndDateTime: tmTime(now + windowMs),
    sort: "relevance,desc",
    size: "100",
  });
  return withArtists(data);
}

export type ConcertSearch =
  | { city: string; stateCode?: string }
  | { geoPoint: string; radiusMiles: number };

// Upcoming music events in a city or around a point, soonest first.
export async function tmConcerts(where: ConcertSearch, days: number): Promise<EventWithArtist[]> {
  const now = Date.now();
  const params: Record<string, string> = {
    classificationName: "music",
    startDateTime: tmTime(now),
    endDateTime: tmTime(now + days * 24 * 60 * 60 * 1000),
    sort: "date,asc",
    size: "100",
  };
  if ("city" in where) {
    params.city = where.city;
    if (where.stateCode) params.stateCode = where.stateCode;
  } else {
    params.geoPoint = where.geoPoint;
    params.radius = String(where.radiusMiles);
    params.unit = "miles";
  }
  return withArtists(await tm("/events.json", params));
}

const isMusic = (a: any) =>
  !a.classifications?.length || a.classifications.some((c: any) => c.segment?.id === MUSIC_SEGMENT);

export type SuggestDebug = { source: string; count: number; error?: string }[];

// Artist suggestions for the search box. Tries Ticketmaster's autocomplete
// endpoint (matches partial words like "calv") and keyword search (whole
// words), then merges them, autocomplete first. `debug` collects what each
// step returned, for /api/suggest?debug=1.
export async function tmSuggestArtists(query: string, debug?: SuggestDebug): Promise<Artist[]> {
  const found: Artist[] = [];
  const add = (artists: Artist[]) => {
    for (const a of artists) if (!found.some((f) => f.id === a.id)) found.push(a);
  };
  for (const path of ["/suggest", "/suggest.json"]) {
    try {
      const data = await tm(path, { keyword: query, resource: "attractions", size: "10" });
      const all: any[] = data._embedded?.attractions ?? [];
      debug?.push({ source: `${path} (all)`, count: all.length });
      const music = all.filter(isMusic);
      debug?.push({ source: `${path} (music)`, count: music.length });
      add(music.map(toArtist));
      break;
    } catch (err) {
      debug?.push({ source: path, count: 0, error: String(err) });
    }
  }
  try {
    const keyword = await tmSearchArtists(query);
    debug?.push({ source: "keyword search", count: keyword.length });
    add(keyword);
  } catch (err) {
    debug?.push({ source: "keyword search", count: 0, error: String(err) });
  }
  return found.slice(0, 6);
}
