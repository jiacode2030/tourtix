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
  if (n === q) return 92;
  if (n.startsWith(q + " ") || n.startsWith(q)) return 85; // "calvin" -> "calvin harris", "calv" -> "calvin harris"
  // Punctuation and spacing don't matter: "acdc" -> "AC/DC", "blink182" -> "blink-182".
  if (n.replace(/ /g, "").startsWith(q.replace(/ /g, ""))) return 80;
  const words = n.split(" ");
  const qWords = q.split(" ");
  // Every typed word starts some word of the name, in any order ("harris calvin").
  if (qWords.every((w) => words.some((nw) => nw.startsWith(w)))) return 70;
  if (n.includes(q)) return 50;
  // Some typed words match: better than nothing.
  const hits = qWords.filter((w) => words.some((nw) => nw.startsWith(w))).length;
  return hits ? 20 + 10 * (hits / qWords.length) : 0;
}

export function rankArtists(query: string, artists: Artist[]): Artist[] {
  const q = fold(query);
  const wantsImitation = IMITATION.test(q);
  return artists
    .map((a, i) => {
      let score = nameScore(query, a.name);
      if (!wantsImitation && IMITATION.test(fold(a.name))) score -= 60;
      // Popularity breaks ties between similar matches, but can't beat a better name match.
      score += Math.min(15, Math.log2(1 + (a.upcomingShows ?? 0)) * 3);
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
    if (!have || (a.upcomingShows ?? 0) > (have.upcomingShows ?? 0)) best.set(key, a);
  }
  return artists.filter((a) => best.get(fold(a.name)) === a);
}

// Merge lists, keeping one entry per Ticketmaster id with the highest show count.
export function mergeArtists(...lists: Artist[][]): Artist[] {
  const byId = new Map<string, Artist>();
  for (const a of lists.flat()) {
    const have = byId.get(a.id);
    if (!have) byId.set(a.id, a);
    else if ((a.upcomingShows ?? 0) > (have.upcomingShows ?? 0)) byId.set(a.id, { ...have, ...a, imageUrl: a.imageUrl ?? have.imageUrl });
    else if (!have.imageUrl && a.imageUrl) byId.set(a.id, { ...have, imageUrl: a.imageUrl });
  }
  return [...byId.values()];
}

// Artists from a lookup list whose names start with what was typed, for
// partial words Ticketmaster's own search can't match ("taylor sw", "calv").
export function matchTyped(query: string, pool: Artist[]): Artist[] {
  return pool.filter((a) => nameScore(query, a.name) >= 70);
}
