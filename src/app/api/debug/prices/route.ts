import { getShows } from "@/lib/data";

// Diagnostic: shows what Ticketmaster and SeatGeek return for an artist, so
// price problems can be traced without access to the API keys. Never echoes
// keys or request URLs. Usage: /api/debug/prices?artist=Calvin%20Harris
export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function getJson(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

async function ticketmaster(name: string) {
  const key = process.env.TICKETMASTER_API_KEY;
  if (!key) return { configured: false };
  const q = new URLSearchParams({ keyword: name, classificationName: "music", size: "5", apikey: key });
  const search = await getJson(`https://app.ticketmaster.com/discovery/v2/attractions.json?${q}`);
  const attraction = search.body?._embedded?.attractions?.[0];
  if (!attraction) return { configured: true, searchStatus: search.status, found: false };
  const eq = new URLSearchParams({ attractionId: attraction.id, size: "100", apikey: key });
  const events = await getJson(`https://app.ticketmaster.com/discovery/v2/events.json?${eq}`);
  const list: any[] = events.body?._embedded?.events ?? [];
  return {
    configured: true,
    attraction: { id: attraction.id, name: attraction.name },
    eventsStatus: events.status,
    events: list.length,
    eventsWithPriceRanges: list.filter((e) => e.priceRanges?.length).length,
    priceRangeTypesSeen: [...new Set(list.flatMap((e) => (e.priceRanges ?? []).map((r: any) => r.type)))],
    sample: list.slice(0, 3).map((e) => ({
      date: e.dates?.start?.localDate,
      city: e._embedded?.venues?.[0]?.city?.name,
      priceRanges: e.priceRanges ?? null,
    })),
  };
}

async function seatgeek(name: string) {
  const id = process.env.SEATGEEK_CLIENT_ID;
  if (!id) return { configured: false };
  const q = new URLSearchParams({ q: name, per_page: "5", client_id: id });
  const search = await getJson(`https://api.seatgeek.com/2/performers?${q}`);
  const performers: any[] = search.body?.performers ?? [];
  const result: Record<string, unknown> = {
    configured: true,
    searchStatus: search.status,
    searchError: search.status === 200 ? undefined : search.body,
    performersFound: performers.map((p) => ({ id: p.id, name: p.name })),
  };
  const exact = performers.find(
    (p) => p.name.toLowerCase().replace(/[^a-z0-9]/g, "") === name.toLowerCase().replace(/[^a-z0-9]/g, ""),
  );
  result.exactMatch = exact ? { id: exact.id, name: exact.name } : null;
  if (!exact) return result;
  const eq = new URLSearchParams({ "performers.id": String(exact.id), per_page: "100", client_id: id });
  const events = await getJson(`https://api.seatgeek.com/2/events?${eq}`);
  const list: any[] = events.body?.events ?? [];
  return {
    ...result,
    eventsStatus: events.status,
    events: list.length,
    eventsWithLowestPrice: list.filter((e) => e.stats?.lowest_price != null).length,
    sample: list.slice(0, 3).map((e) => ({
      date: e.datetime_local,
      city: e.venue?.city,
      stats: e.stats ?? null,
    })),
  };
}

export async function GET(req: Request) {
  const name = new URL(req.url).searchParams.get("artist")?.trim();
  if (!name) return Response.json({ error: "add ?artist=Name" }, { status: 400 });
  try {
    const [tm, sg] = await Promise.all([ticketmaster(name), seatgeek(name)]);
    const attraction = (tm as any).attraction;
    let merged = null;
    if (attraction) {
      const shows = await getShows({ id: attraction.id, name: attraction.name, imageUrl: null, genre: null, upcomingShows: 0 });
      merged = {
        shows: shows.length,
        showsWithSeatGeekLink: shows.filter((s) => s.links.some((l) => l.seller === "SeatGeek")).length,
        showsWithAnyPrice: shows.filter((s) => s.links.some((l) => l.allInPrice != null)).length,
      };
    }
    return Response.json({ artist: name, ticketmaster: tm, seatgeek: sg, siteResult: merged });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
