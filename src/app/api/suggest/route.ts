import { suggestArtists } from "@/lib/data";
import { SEARCH_LIMIT, allow, clientIp } from "@/lib/rate-limit";
import type { SuggestDebug } from "@/lib/ticketmaster";

// Artist name suggestions for the search box. Ticketmaster responses are
// cached for 5 minutes, so repeated prefixes don't cost extra API calls.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  if (q.length < 2) return Response.json([]);
  if (!allow(`suggest:${clientIp(req.headers)}`, SEARCH_LIMIT.limit, SEARCH_LIMIT.windowMs)) {
    return Response.json([], { status: 429, headers: { "Retry-After": "60" } });
  }
  // ?debug=1 shows which lookup returned what (no keys or URLs are included).
  const debug: SuggestDebug | undefined = new URL(req.url).searchParams.has("debug") ? [] : undefined;
  try {
    const artists = await suggestArtists(q, debug);
    const list = artists.map((a) => ({ id: a.id, name: a.name, imageUrl: a.imageUrl }));
    return Response.json(debug ? { results: artists.map((a) => `${a.name} (shows ${a.upcomingShows}, notable ${a.notability ?? 0})`), steps: debug } : list);
  } catch (err) {
    console.error(err);
    return Response.json([]);
  }
}
