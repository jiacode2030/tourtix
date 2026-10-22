// Genre filters for the homepage, using Ticketmaster's music genre names.
export const GENRES = [
  "Dance/Electronic",
  "Pop",
  "Hip-Hop/Rap",
  "R&B",
  "Rock",
  "Alternative",
  "Country",
  "Latin",
] as const;

export type Genre = (typeof GENRES)[number];

export const isGenre = (g: string | undefined): g is Genre => !!g && (GENRES as readonly string[]).includes(g);
