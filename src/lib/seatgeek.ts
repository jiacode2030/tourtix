import type { Show } from "./types";

const BASE = "https://api.seatgeek.com/2";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function sg(path: string, params: Record<string, string>) {
  const id = process.env.SEATGEEK_CLIENT_ID;
  if (!id) throw new Error("SEATGEEK_CLIENT_ID is not set");
  const qs = new URLSearchParams({ ...params, client_id: id });
  const res = await fetch(`${BASE}${path}?${qs}`, {
    next: { revalidate: 900 },
  });
  if (!res.ok) throw new Error(`SeatGeek ${res.status}: ${path}`);
  return res.json();
}

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

async function findPerformerId(artistName: string): Promise<number | null> {
  const data = await sg("/performers", { q: artistName, per_page: "10" });
  const performers: any[] = data.performers ?? [];
  const exact = performers.find((p) => normalize(p.name) === normalize(artistName));
  return exact?.id ?? null;
}

function toShow(e: any): Show {
  const v = e.venue ?? {};
  const [date, time] = (e.datetime_local ?? "").split("T");
  const listed = (e.stats?.listing_count ?? 0) > 0;
  return {
    id: `sg-${e.id}`,
    name: e.short_title ?? e.title,
    date: date || null,
    time: e.time_tbd ? null : (time ?? null),
    timezone: v.timezone ?? null,
    venue: v.name ?? null,
    city: v.city ?? null,
    region: v.state ?? null,
    country: v.country ?? null,
    links: e.url ? [{ seller: "SeatGeek", url: e.url }] : [],
    status: listed ? "onsale" : "announced",
    publicSaleStart: null,
    presales: [],
    priceMin: null,
    priceMax: null,
    currency: null,
  };
}

// Returns an artist's SeatGeek shows, or [] if SeatGeek is not configured,
// the artist can't be matched exactly by name, or the API fails. SeatGeek is
// a secondary source, so it must never break the page.
export async function sgGetShows(artistName: string): Promise<Show[]> {
  if (!process.env.SEATGEEK_CLIENT_ID) return [];
  try {
    const performerId = await findPerformerId(artistName);
    if (!performerId) return [];
    const data = await sg("/events", {
      "performers.id": String(performerId),
      per_page: "100",
      sort: "datetime_local.asc",
    });
    return (data.events ?? []).map(toShow);
  } catch (err) {
    console.error(err);
    return [];
  }
}

// Same show on two sites = same date and same city.
const showKey = (s: Show) => `${s.date}|${normalize(s.city ?? "")}`;

export function mergeShows(primary: Show[], extra: Show[]): Show[] {
  const merged = primary.map((s) => ({ ...s, links: [...s.links] }));
  const byKey = new Map(merged.map((s) => [showKey(s), s]));
  for (const e of extra) {
    const match = byKey.get(showKey(e));
    if (match) {
      for (const l of e.links) {
        if (!match.links.some((x) => x.seller === l.seller)) match.links.push(l);
      }
    } else {
      merged.push(e);
    }
  }
  return merged.sort((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999"));
}
