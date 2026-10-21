import { suggestArtists } from "@/lib/data";

// Artist name suggestions for the search box. Ticketmaster responses are
// cached for 5 minutes, so repeated prefixes don't cost extra API calls.
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q")?.trim().slice(0, 80) ?? "";
  if (q.length < 2) return Response.json([]);
  try {
    const artists = await suggestArtists(q);
    return Response.json(artists.map((a) => ({ id: a.id, name: a.name, imageUrl: a.imageUrl })));
  } catch (err) {
    console.error(err);
    return Response.json([]);
  }
}
