import type { Show } from "./types";

export type SaleStart = { label: string; start: string };

// Presale and general-sale start times that fall within the next `windowMs`,
// earliest first.
// Ticketmaster lists add-ons like "VIP Package Onsale" as presales that start
// with (or after) the general sale. They aren't pre-sales, so leave them out.
export function realPresales(show: Show) {
  const general = show.publicSaleStart ? Date.parse(show.publicSaleStart) : null;
  return show.presales.filter((p) => !p.start || general == null || Date.parse(p.start) < general);
}

// Shows whose sale times no longer mean anything.
const NOT_SELLING = new Set(["cancelled", "offsale", "postponed"]);

export function upcomingSaleStarts(show: Show, windowMs: number, now = Date.now()): SaleStart[] {
  if (NOT_SELLING.has(show.status)) return [];
  const starts = [
    ...realPresales(show).map((p) => ({ label: p.name, start: p.start })),
    { label: "General sale", start: show.publicSaleStart },
  ];
  return starts
    .filter((x): x is SaleStart => {
      if (!x.start) return false;
      const t = new Date(x.start).getTime();
      return t > now && t - now <= windowMs;
    })
    .sort((a, b) => a.start.localeCompare(b.start));
}

export type TicketDrop = {
  artistId: string;
  artistName: string;
  imageUrl: string | null;
  show: Show;
  sale: SaleStart;
  // Other shows by the same artist with a sale in the same window.
  moreShows: number;
};

// Collapses shows to one entry per artist (their soonest sale), soonest first.
export function groupDrops(
  items: { artistId: string; artistName: string; imageUrl: string | null; show: Show }[],
  windowMs: number,
  now = Date.now(),
): TicketDrop[] {
  const byArtist = new Map<string, TicketDrop>();
  for (const item of items) {
    const sale = upcomingSaleStarts(item.show, windowMs, now)[0];
    if (!sale) continue;
    const existing = byArtist.get(item.artistId);
    if (!existing) {
      byArtist.set(item.artistId, { ...item, sale, moreShows: 0 });
    } else if (sale.start < existing.sale.start) {
      byArtist.set(item.artistId, { ...item, sale, moreShows: existing.moreShows + 1 });
    } else {
      existing.moreShows++;
    }
  }
  return [...byArtist.values()].sort((a, b) => a.sale.start.localeCompare(b.sale.start));
}
