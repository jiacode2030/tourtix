import type { Artist } from "./types";

// Ticketmaster returns matches in its own order, so "calvin" can bury Calvin
// Harris under tribute acts and other Calvins. This ranks matches the way
// people expect: how well the name matches first, then how well known the
// artist is (how many upcoming shows), with tribute and cover acts last.

const fold = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // é -> e
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const IMITATION = /\b(tribute|cover band|covers|ultimate|experience|salute|karaoke|impersonat\w*|celebrating|performing the music|a night of|the music of|plays the music|symphonic|orchestral|string quartet|vitamin string quartet|rock the|dj set tribute)\b/;

export function nameScore(query: string, name: string): number {
  const q = fold(query);
  const n = fold(name);
  if (!q || !n) return 0;
  if (n === q) return 87;
  if (n.startsWith(q + " ") || n.startsWith(q)) return 85; // "calvin" -> "calvin harris", "calv" -> "calvin harris"
  // Punctuation and spacing don't matter: "acdc" -> "AC/DC", "blink182" -> "blink-182".
  if (n.replace(/ /g, "").startsWith(q.replace(/ /g, ""))) return 80;
  const words = n.split(" ");
  const qWords = q.split(" ");
  // Every typed word starts some word of the name, in any order ("harris calvin").
  if (qWords.every((w) => words.some((nw) => nw.startsWith(w)))) return 78;
  if (n.includes(q)) return 50;
  // Some typed words match: better than nothing.
  const hits = qWords.filter((w) => words.some((nw) => nw.startsWith(w))).length;
  return hits ? 20 + 10 * (hits / qWords.length) : 0;
}

// Touring a lot and being well known both count, so a famous artist between
// tours still beats a small act with a similar name.
export function fame(a: Artist): number {
  const touring = Math.min(24, Math.log2(1 + (a.upcomingShows ?? 0)) * 4.5);
  const known = Math.min(18, (a.notability ?? 0) * 1.5);
  // The stronger signal counts fully, the weaker a little: either one alone
  // can make an artist stand out (touring a lot, or very well known).
  return Math.max(touring, known) + 0.25 * Math.min(touring, known);
}

export function rankArtists(query: string, artists: Artist[]): Artist[] {
  const q = fold(query);
  const wantsImitation = IMITATION.test(q);
  return artists
    .map((a, i) => {
      let score = nameScore(query, a.name);
      if (!wantsImitation && IMITATION.test(fold(a.name))) score -= 60;
      // Popularity breaks ties between similar matches, but can't beat a better name match.
      score += fame(a);
      return { a, score, i };
    })
    .sort((x, y) => y.score - x.score || x.i - y.i) // ties keep Ticketmaster's order
    .map((x) => x.a);
}

// Several Ticketmaster entries can share one name ("Noah" appears four times).
// Keep the best known of each so the list isn't full of lookalikes.
export function dedupeByName(artists: Artist[]): Artist[] {
  const best = new Map<string, Artist>();
  for (const a of artists) {
    const key = fold(a.name);
    const have = best.get(key);
    if (!have || fame(a) > fame(have)) best.set(key, a);
  }
  return artists.filter((a) => best.get(fold(a.name)) === a);
}

// Merge lists, keeping one entry per Ticketmaster id with the best of each field.
export function mergeArtists(...lists: Artist[][]): Artist[] {
  const byId = new Map<string, Artist>();
  for (const a of lists.flat()) {
    const have = byId.get(a.id);
    if (!have) byId.set(a.id, a);
    else {
      byId.set(a.id, {
        ...have,
        upcomingShows: Math.max(have.upcomingShows ?? 0, a.upcomingShows ?? 0),
        notability: Math.max(have.notability ?? 0, a.notability ?? 0),
        imageUrl: have.imageUrl ?? a.imageUrl,
        genre: have.genre ?? a.genre,
      });
    }
  }
  return [...byId.values()];
}

// Artists from a lookup list whose names start with what was typed, for
// partial words Ticketmaster's own search can't match ("taylor sw", "calv").
export function matchTyped(query: string, pool: Artist[]): Artist[] {
  return pool.filter((a) => nameScore(query, a.name) >= 70);
}
