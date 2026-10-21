import { cache } from "react";
import { sampleArtists, sampleShows } from "./sample-data";
import { mergeShows, sgGetShows } from "./seatgeek";
import { groupDrops, type TicketDrop } from "./sales";
import {
  type ConcertSearch,
  tmConcerts,
  tmEventsGoingOnSale,
  tmGetArtist,
  tmGetShows,
  tmPopularArtists,
  tmSearchArtists,
  tmSuggestArtists,
} from "./ticketmaster";
import type { Artist, Show } from "./types";

export const usingSampleData = !process.env.TICKETMASTER_API_KEY;

export async function searchArtists(query: string): Promise<Artist[]> {
  if (usingSampleData) {
    const q = query.toLowerCase();
    return sampleArtists.filter((a) => a.name.toLowerCase().includes(q));
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

// Homepage sections are extras: if Ticketmaster fails they're just hidden.
export async function popularArtists(limit = 8): Promise<Artist[]> {
  if (usingSampleData) return sampleArtists.slice(0, limit);
  try {
    return await tmPopularArtists(limit);
  } catch (err) {
    console.error(err);
    return [];
  }
}

export async function upcomingDrops(windowMs: number, limit = 8): Promise<TicketDrop[]> {
  try {
    const items = usingSampleData
      ? sampleArtists.flatMap((a) => sampleShows(a.id).map((show) => ({ artist: a, show })))
      : await tmEventsGoingOnSale(windowMs);
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

export async function suggestArtists(query: string): Promise<Artist[]> {
  if (usingSampleData) return (await searchArtists(query)).slice(0, 6);
  return tmSuggestArtists(query);
}
