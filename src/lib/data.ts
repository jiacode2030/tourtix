import { cache } from "react";
import { rankArtists } from "./rank";
import { sampleArtists, sampleShows } from "./sample-data";
import { mergeShows, sgGetShows } from "./seatgeek";
import { justWentOnSale, livePresales } from "./live";
import { groupDrops, type TicketDrop, upcomingSaleStarts } from "./sales";
import {
  type ConcertSearch,
  tmConcerts,
  tmEventsGoingOnSale,
  tmGetArtist,
  tmGetShows,
  tmPopularArtists,
  tmSearchArtists,
  tmFindArtists,
  type SuggestDebug,
} from "./ticketmaster";
import type { Artist, Show } from "./types";

export const usingSampleData = !process.env.TICKETMASTER_API_KEY;

export async function searchArtists(query: string): Promise<Artist[]> {
  if (usingSampleData) {
    const q = query.toLowerCase();
    return rankArtists(query, sampleArtists.filter((a) => a.name.toLowerCase().includes(q)));
  }
  return tmSearchArtists(query);
}

// Wrapped in cache() so the page, its metadata and its preview image share
// one lookup per request.
export const getArtist = cache(async (id: string): Promise<Artist | null> => {
  if (usingSampleData) return sampleArtists.find((a) => a.id === id) ?? null;
  return tmGetArtist(id);
});

export async function getShows(artist: Artist): Promise<Show[]> {
  if (usingSampleData) return sampleShows(artist.id);
  const [tm, sg] = await Promise.all([tmGetShows(artist.id), sgGetShows(artist.name)]);
  return mergeShows(tm, sg);
}

export type PopularArtist = Artist & { nextSale: { label: string; start: string } | null };

const MONTH_MS = 30 * 24 * 60 * 60 * 1000;

// Homepage sections are extras: if Ticketmaster fails they're just hidden.
export async function popularArtists(limit = 8, genre?: string): Promise<PopularArtist[]> {
  try {
    const groups = usingSampleData
      ? sampleArtists.slice(0, limit).map((artist) => ({ artist, shows: sampleShows(artist.id) }))
      : await tmPopularArtists(limit, genre);
    return groups.map(({ artist, shows }) => {
      const sale = shows
        .flatMap((s) => upcomingSaleStarts(s, MONTH_MS))
        .sort((x, y) => x.start.localeCompare(y.start))[0];
      return { ...artist, nextSale: sale ? { label: sale.label, start: sale.start } : null };
    });
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function upcomingDrops(windowMs: number, limit = 8, genre?: string): Promise<TicketDrop[]> {
  try {
    const items = usingSampleData
      ? sampleArtists.flatMap((a) => sampleShows(a.id).map((show) => ({ artist: a, show })))
      : await tmEventsGoingOnSale(windowMs, genre);
    return groupDrops(
      items.map(({ artist, show }) => ({
        artistId: artist.id,
        artistName: artist.name,
        imageUrl: artist.imageUrl,
        show,
      })),
      windowMs,
    ).slice(0, limit);
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function concerts(where: ConcertSearch, days = 30) {
  if (usingSampleData) {
    return sampleArtists.flatMap((a) => sampleShows(a.id).map((show) => ({ artist: a, show })));
  }
  return tmConcerts(where, days);
}

export async function suggestArtists(query: string, debug?: SuggestDebug): Promise<Artist[]> {
  if (usingSampleData) return (await searchArtists(query)).slice(0, 6);
  return tmFindArtists(query, 6, debug);
}

export type LiveArtist = {
  artistId: string;
  artistName: string;
  imageUrl: string | null;
  detail: string;
  endsAt: string | null;
  timezone: string | null;
};

// Presales open right now and general sales that just started, across the
// most relevant US music events (the same cached Ticketmaster response as
// the popular artists list, so no extra API calls).
export async function liveSales(genre?: string): Promise<{ presales: LiveArtist[]; justOnSale: LiveArtist[] }> {
  try {
    const groups = usingSampleData
      ? sampleArtists.map((artist) => ({ artist, shows: sampleShows(artist.id) }))
      : await tmPopularArtists(100, genre);
    const presales: LiveArtist[] = [];
    const justOnSale: LiveArtist[] = [];
    for (const { artist, shows } of groups) {
      const base = { artistId: artist.id, artistName: artist.name, imageUrl: artist.imageUrl };
      const [sale] = livePresales(shows);
      if (sale) {
        presales.push({
          ...base,
          detail: `${sale.label} · ${sale.shows.length} ${sale.shows.length === 1 ? "show" : "shows"}`,
          endsAt: sale.endsAt,
          timezone: sale.shows[0].timezone,
        });
      }
      const fresh = justWentOnSale(shows, 2 * 24 * 60 * 60 * 1000);
      if (fresh.length) {
        justOnSale.push({
          ...base,
          detail: `General sale · ${fresh.length} ${fresh.length === 1 ? "show" : "shows"}`,
          endsAt: null,
          timezone: fresh[0].timezone,
        });
      }
    }
    return { presales: presales.slice(0, 8), justOnSale: justOnSale.slice(0, 8) };
  } catch (err) {
    console.error(err);
    return { presales: [], justOnSale: [] };
  }
}
