import { getArtist, getShows } from "@/lib/data";
import { nextDrop } from "@/lib/drops";
import { upcomingSaleStarts } from "@/lib/sales";

// TEMPORARY diagnostic: shows the sale data TourTix reads for an artist's
// shows and what it computes from it. No keys or personal data.
// Usage: /api/debug/sales?id=<artist id>
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id") ?? "";
  try {
    const artist = await getArtist(id);
    if (!artist) return Response.json({ error: "artist not found" }, { status: 404 });
    const shows = await getShows(artist);
    const now = Date.now();
    return Response.json({
      now: new Date(now).toISOString(),
      artist: artist.name,
      nextDrop: nextDrop(shows, null, now)?.label ?? null,
      shows: shows.slice(0, 8).map((s) => ({
        date: s.date,
        city: s.city,
        status: s.status,
        timezone: s.timezone,
        publicSaleStart: s.publicSaleStart,
        presales: s.presales.map((p) => ({ name: p.name, start: p.start, end: p.end })),
        upcoming: upcomingSaleStarts(s, Number.MAX_SAFE_INTEGER, now),
        raw: s.rawSales ?? null,
      })),
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
