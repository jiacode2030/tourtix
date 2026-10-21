// Plain links to other ticket sites' public search pages. No API, no data
// fetched, no affiliate tracking: TourTix doesn't know whether these sites
// have the show, and the UI says so. Ticketmaster's API terms forbid earning
// revenue from pages built on its data, so never add affiliate parameters here.
const SITES: { name: string; url: (q: string) => string }[] = [
  { name: "StubHub", url: (q) => `https://www.stubhub.com/search?q=${q}` },
  { name: "Vivid Seats", url: (q) => `https://www.vividseats.com/search?searchTerm=${q}` },
  { name: "SeatGeek", url: (q) => `https://seatgeek.com/search?search=${q}` },
];

export function otherSiteSearches(artistName: string, city: string | null, connected: string[]) {
  const q = encodeURIComponent([artistName, city].filter(Boolean).join(" "));
  return SITES.filter((s) => !connected.includes(s.name)).map((s) => ({ name: s.name, url: s.url(q) }));
}
