// Placeholder data used only when TICKETMASTER_API_KEY is not set,
// so the site can be developed before API access is approved.
// Not real tour dates.
import { computeStatus } from "./status";
import type { Artist, Show } from "./types";

export const sampleArtists: Artist[] = [
  { id: "sample-calvin-harris", name: "Calvin Harris", imageUrl: null, genre: "Dance/Electronic", upcomingShows: 4 },
  { id: "sample-fred-again", name: "Fred again..", imageUrl: null, genre: "Dance/Electronic", upcomingShows: 3 },
  { id: "sample-dua-lipa", name: "Dua Lipa", imageUrl: null, genre: "Pop", upcomingShows: 3 },
  { id: "sample-kaytranada", name: "Kaytranada", imageUrl: null, genre: "Dance/Electronic", upcomingShows: 2 },
];

function daysFromNow(n: number) {
  return new Date(Date.now() + n * 86_400_000).toISOString();
}

type Raw = Omit<Show, "status"> & { code?: string };

function show(r: Raw): Show {
  const { code, ...rest } = r;
  return { ...rest, status: computeStatus(code, r.publicSaleStart, r.presales) };
}

const base = {
  time: "21:00:00",
  url: null,
  currency: "USD",
};

const raw: Record<string, Raw[]> = {
  "sample-calvin-harris": [
    { ...base, id: "s1", name: "Calvin Harris", date: daysFromNow(30).slice(0, 10), venue: "Sample Arena", city: "Las Vegas", region: "NV", country: "US", publicSaleStart: daysFromNow(-10), presales: [], priceMin: 89, priceMax: 350, code: "onsale" },
    { ...base, id: "s2", name: "Calvin Harris", date: daysFromNow(45).slice(0, 10), venue: "Sample Pavilion", city: "Los Angeles", region: "CA", country: "US", publicSaleStart: daysFromNow(2), presales: [{ name: "Artist Presale", start: daysFromNow(-1), end: daysFromNow(1) }], priceMin: 75, priceMax: 280, code: "onsale" },
    { ...base, id: "s3", name: "Calvin Harris", date: daysFromNow(60).slice(0, 10), venue: "Sample Gardens", city: "New York", region: "NY", country: "US", publicSaleStart: daysFromNow(9), presales: [{ name: "Fan Presale", start: daysFromNow(7), end: daysFromNow(8) }], priceMin: null, priceMax: null, code: "onsale" },
    { ...base, id: "s4", name: "Calvin Harris", date: daysFromNow(75).slice(0, 10), venue: "Sample Field", city: "Miami", region: "FL", country: "US", publicSaleStart: daysFromNow(-20), presales: [], priceMin: null, priceMax: null, code: "offsale" },
  ],
  "sample-fred-again": [
    { ...base, id: "s5", name: "Fred again..", date: daysFromNow(20).slice(0, 10), venue: "Sample Hall", city: "Chicago", region: "IL", country: "US", publicSaleStart: daysFromNow(-5), presales: [], priceMin: 65, priceMax: 180, code: "onsale" },
    { ...base, id: "s6", name: "Fred again..", date: daysFromNow(40).slice(0, 10), venue: "Sample Warehouse", city: "Brooklyn", region: "NY", country: "US", publicSaleStart: daysFromNow(5), presales: [], priceMin: null, priceMax: null, code: "onsale" },
    { ...base, id: "s7", name: "Fred again..", date: daysFromNow(55).slice(0, 10), venue: "Sample Theatre", city: "Austin", region: "TX", country: "US", publicSaleStart: daysFromNow(-3), presales: [], priceMin: 70, priceMax: 160, code: "onsale" },
  ],
  "sample-dua-lipa": [
    { ...base, id: "s8", name: "Dua Lipa", date: daysFromNow(35).slice(0, 10), venue: "Sample Stadium", city: "Seattle", region: "WA", country: "US", publicSaleStart: daysFromNow(-15), presales: [], priceMin: 95, priceMax: 450, code: "onsale" },
    { ...base, id: "s9", name: "Dua Lipa", date: daysFromNow(50).slice(0, 10), venue: "Sample Center", city: "Denver", region: "CO", country: "US", publicSaleStart: daysFromNow(12), presales: [], priceMin: null, priceMax: null, code: "onsale" },
    { ...base, id: "s10", name: "Dua Lipa", date: daysFromNow(65).slice(0, 10), venue: "Sample Dome", city: "Atlanta", region: "GA", country: "US", publicSaleStart: daysFromNow(-15), presales: [], priceMin: null, priceMax: null, code: "cancelled" },
  ],
  "sample-kaytranada": [
    { ...base, id: "s11", name: "Kaytranada", date: daysFromNow(25).slice(0, 10), venue: "Sample Club", city: "San Francisco", region: "CA", country: "US", publicSaleStart: daysFromNow(-8), presales: [], priceMin: 55, priceMax: 120, code: "onsale" },
    { ...base, id: "s12", name: "Kaytranada", date: daysFromNow(42).slice(0, 10), venue: "Sample Ballroom", city: "Toronto", region: "ON", country: "CA", publicSaleStart: daysFromNow(3), presales: [], priceMin: null, priceMax: null, code: "onsale" },
  ],
};

export function sampleShows(artistId: string): Show[] {
  return (raw[artistId] ?? []).map(show);
}
