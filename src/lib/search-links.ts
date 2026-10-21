// Plain links to other ticket sites' own search pages. No API, no data
// fetched, no affiliate tracking: TourTix doesn't know whether these sites
// have the show, and the UI says so. Ticketmaster's API terms forbid earning
// revenue from pages built on its data, so never add affiliate parameters here.
//
// Only sites whose search URL is known to work are listed. Checked and left
// out: TickPick and DICE (no linkable search), See Tickets (search didn't
// work), Etix (mostly fairs and small venues), Eventbrite (open listings with
// reported fake concert tickets).

type Site = { name: string; url: (s: { query: string; artist: string }) => string };

const enc = encodeURIComponent;

// Resale marketplaces: tickets from other fans and brokers.
const RESALE: Site[] = [
  { name: "StubHub", url: ({ query }) => `https://www.stubhub.com/search?q=${enc(query)}` },
  { name: "Vivid Seats", url: ({ query }) => `https://www.vividseats.com/search?searchTerm=${enc(query)}` },
  { name: "SeatGeek", url: ({ query }) => `https://seatgeek.com/search?search=${enc(query)}` },
  { name: "Gametime", url: ({ query }) => `https://gametime.co/search?q=${enc(query)}` },
];

// Official sellers some venues use instead of Ticketmaster.
const PRIMARY: Site[] = [
  // AXS's search page expects the search words encoded twice (calvin%2520harris).
  { name: "AXS", url: ({ artist }) => `https://www.axs.com/search?searchQuery=${enc(enc(artist.toLowerCase()))}` },
];

export type SearchLink = { name: string; url: string };

function links(sites: Site[], query: string, artist: string, connected: string[]): SearchLink[] {
  return sites.filter((s) => !connected.includes(s.name)).map((s) => ({ name: s.name, url: s.url({ query, artist }) }));
}

export function otherSiteSearches(artistName: string, city: string | null, connected: string[]) {
  const query = [artistName, city].filter(Boolean).join(" ");
  return {
    resale: links(RESALE, query, artistName, connected),
    official: links(PRIMARY, query, artistName, connected),
  };
}
