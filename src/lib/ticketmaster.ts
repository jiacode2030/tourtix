import { apiFetch } from "./http";
import { cleanUrl, sellerName } from "./links";
import { dedupeByName, matchTyped, mergeArtists, nameScore, rankArtists } from "./rank";
import { presaleDisplayName } from "./presale-names";
import { computeStatus } from "./status";
import type { Artist, Presale, Show, ShowExtras } from "./types";

const BASE = "https://app.ticketmaster.com/discovery/v2";

// Ticketmaster's segment ID for Music.
const MUSIC_SEGMENT = "KZFzniwnSyZfZ7v7nJ";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function tm(path: string, params: Record<string, string>, revalidate = 300) {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) throw new Error("TICKETMASTER_API_KEY is not set");
  const qs = new URLSearchParams({ ...params, apikey: key });
  return apiFetch(`${BASE}${path}?${qs}`, revalidate, `Ticketmaster ${path}`);
}

function pickImage(images: any[] | undefined): string | null {
  if (!images?.length) return null;
  const wide = images
    .filter((i) => i.ratio === "16_9")
    .sort((a, b) => b.width - a.width);
  return (wide[0] ?? images[0]).url ?? null;
}

// Well-known artists have a Wikipedia page and links on several platforms;
// tribute acts and local bands usually don't.
function notability(links: unknown): number {
  if (!links || typeof links !== "object") return 0;
  const have = Object.entries(links as Record<string, unknown>).filter(([, v]) => Array.isArray(v) && v.length > 0).map(([k]) => k);
  const wiki = have.includes("wiki") ? 6 : 0;
  const spotify = have.includes("spotify") ? 2 : 0;
  const others = Math.min(4, have.filter((k) => k !== "wiki" && k !== "spotify").length);
  return wiki + spotify + others;
}

function toArtist(a: any): Artist {
  return {
    id: a.id,
    name: a.name,
    imageUrl: pickImage(a.images),
    genre: a.classifications?.[0]?.genre?.name ?? null,
    upcomingShows: a.upcomingEvents?._total ?? 0,
    notability: notability(a.externalLinks),
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
    url: cleanUrl(p.url),
    description: p.description ?? null,
  }));
  const publicSaleStart = e.sales?.public?.startTBD ? null : realTime(e.sales?.public?.startDateTime);
  // Discovery price ranges are usually face value before fees; only use one
  // that says it includes fees.
  const allIn = (e.priceRanges ?? []).find((r: any) => /fee/i.test(r.type ?? ""));
  const link = cleanUrl(e.url);
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
    links: link
      ? [
          {
            seller: sellerName(link),
            url: link,
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
  return tmFindArtists(query, 24);
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

export type SuggestDebug = { source: string; count: number; error?: string }[];

// The most in-demand US touring artists, as a lookup list for partial names.
// Ticketmaster's keyword search only matches whole words, so "calv" or
// "taylor sw" find nothing there. Loaded rarely (hourly) to keep API use low.
// An artist's show count here is how many of the top events are theirs, a
// good-enough popularity signal for ranking.
const POOL_TTL_MS = 60 * 60 * 1000;
let poolCache: { at: number; artists: Artist[] } | null = null;
let poolInflight: Promise<Artist[]> | null = null;

// Responses this size are too big for Next's data cache, so the list is kept
// in memory instead: one load per server instance per hour.
export async function tmArtistPool(): Promise<Artist[]> {
  if (poolCache && Date.now() - poolCache.at < POOL_TTL_MS) return poolCache.artists;
  poolInflight ??= loadPool().finally(() => {
    poolInflight = null;
  });
  return poolInflight;
}

async function loadPool(): Promise<Artist[]> {
  const pages = await Promise.all(
    [0, 1, 2].map((page) =>
      tm(
        "/events.json",
        { classificationName: "music", countryCode: "US", sort: "relevance,desc", size: "200", page: String(page) },
        0,
      ).catch(() => null),
    ),
  );
  const counts = new Map<string, Artist>();
  for (const data of pages) {
    for (const { artist } of withArtists(data ?? {})) {
      const have = counts.get(artist.id);
      counts.set(artist.id, have ? { ...have, upcomingShows: have.upcomingShows + 1 } : { ...artist, upcomingShows: 1 });
    }
  }
  const artists = [...counts.values()];
  // If every page failed, try again soon instead of caching an empty list for an hour.
  poolCache = { at: artists.length ? Date.now() : Date.now() - POOL_TTL_MS + 60_000, artists };
  return artists;
}

// Artist lookup for the search box and results page. Combines Ticketmaster's
// autocomplete and keyword search with the lookup list above, then ranks by
// how well the name matches and how well known the artist is. `debug`
// collects what each step returned, for /api/suggest?debug=1.
export async function tmFindArtists(query: string, limit: number, debug?: SuggestDebug): Promise<Artist[]> {
  const words = query.trim().split(/\s+/);
  // "taylor sw": search the finished words too; Ticketmaster can't match "sw".
  const finished = words.length > 1 ? words.slice(0, -1).join(" ") : null;

  const [keyword, keywordFinished, pool] = await Promise.all([
    tmKeyword(query, debug, "keyword search"),
    finished ? tmKeyword(finished, debug, `keyword search "${finished}"`) : Promise.resolve([] as Artist[]),
    tmArtistPool().catch((err) => {
      debug?.push({ source: "artist lookup list", count: 0, error: String(err) });
      return [] as Artist[];
    }),
  ]);
  const matches = matchTyped(query, pool);
  debug?.push({ source: "lookup list matches", count: matches.length });
  let merged = mergeArtists(matches, keyword, keywordFinished);

  // Nothing matched the typed (possibly unfinished) text: try a wildcard search.
  if (!merged.some((a) => nameScore(query, a.name) >= 70) && query.trim().length >= 3) {
    const wild = await tmKeyword(`${query.trim()}*`, debug, "wildcard search");
    merged = mergeArtists(merged, wild);
  }
  return rankArtists(query, dedupeByName(merged)).slice(0, limit);
}

async function tmKeyword(keyword: string, debug: SuggestDebug | undefined, label: string): Promise<Artist[]> {
  try {
    const data = await tm("/attractions.json", { keyword, classificationName: "music", size: "50" });
    const artists = (data._embedded?.attractions ?? []).map(toArtist);
    debug?.push({ source: label, count: artists.length });
    return artists;
  } catch (err) {
    debug?.push({ source: label, count: 0, error: String(err) });
    return [];
  }
}
