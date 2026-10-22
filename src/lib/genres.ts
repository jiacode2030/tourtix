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

// Ticketmaster sometimes files non-music events (a Grand Prix weekend, a
// wrestling show) under music. They aren't artists, so lists skip them.
const NOT_MUSIC = /motorsport|racing|wrestling|rodeo|e-?sports|\bsports?\b/i;
export const isMusicGenre = (genre: string | null | undefined) => !genre || !NOT_MUSIC.test(genre);

export type Genre = (typeof GENRES)[number];

export const isGenre = (g: string | undefined): g is Genre => !!g && (GENRES as readonly string[]).includes(g);
