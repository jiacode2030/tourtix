import { sampleArtists, sampleShows } from "./sample-data";
import { tmGetArtist, tmGetShows, tmSearchArtists } from "./ticketmaster";
import type { Artist, Show } from "./types";

export const usingSampleData = !process.env.TICKETMASTER_API_KEY;

export async function searchArtists(query: string): Promise<Artist[]> {
  if (usingSampleData) {
    const q = query.toLowerCase();
    return sampleArtists.filter((a) => a.name.toLowerCase().includes(q));
  }
  return tmSearchArtists(query);
}

export async function getArtist(id: string): Promise<Artist | null> {
  if (usingSampleData) return sampleArtists.find((a) => a.id === id) ?? null;
  return tmGetArtist(id);
}

export async function getShows(artistId: string): Promise<Show[]> {
  if (usingSampleData) return sampleShows(artistId);
  return tmGetShows(artistId);
}

export function featuredArtists(): Artist[] {
  return usingSampleData ? sampleArtists : [];
}
