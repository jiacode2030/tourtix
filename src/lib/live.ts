import { realPresales } from "./sales";
import type { Show } from "./types";

const NOT_SELLING = new Set(["cancelled", "offsale", "postponed"]);

export type LiveSale = {
  label: string;
  // Shows where this sale is open right now.
  shows: Show[];
  // When the window closes, if Ticketmaster says (earliest across shows).
  endsAt: string | null;
};

// Presales that are open right now, grouped by name. A presale with no end
// time counts as open until the general sale starts.
export function livePresales(shows: Show[], now = Date.now()): LiveSale[] {
  const groups = new Map<string, LiveSale>();
  for (const show of shows) {
    if (NOT_SELLING.has(show.status)) continue;
    const publicStart = show.publicSaleStart ? Date.parse(show.publicSaleStart) : null;
    for (const p of realPresales(show)) {
      if (!p.start || Date.parse(p.start) > now) continue;
      const end = p.end ? Date.parse(p.end) : publicStart;
      if (end != null && end <= now) continue;
      const g = groups.get(p.name) ?? { label: p.name, shows: [], endsAt: null };
      if (!g.shows.includes(show)) g.shows.push(show);
      if (p.end && (!g.endsAt || p.end < g.endsAt)) g.endsAt = p.end;
      groups.set(p.name, g);
    }
  }
  return [...groups.values()].sort((a, b) => b.shows.length - a.shows.length);
}

// Shows whose general sale started within `windowMs` (e.g. the last 2 days).
export function justWentOnSale(shows: Show[], windowMs: number, now = Date.now()): Show[] {
  return shows.filter((s) => {
    if (NOT_SELLING.has(s.status) || !s.publicSaleStart) return false;
    const t = Date.parse(s.publicSaleStart);
    return t <= now && now - t <= windowMs;
  });
}
