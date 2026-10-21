// Plain links to other ticket sites. No API, no data fetched, no affiliate
// tracking: TourTix doesn't know whether these sites have the show, and the
// UI says so. Ticketmaster's API terms forbid earning revenue from pages
// built on its data, so never add affiliate parameters here.

type Site = {
  name: string;
  // The site's own search page, when its URL format is known. Otherwise we
  // link to a Google search limited to the site's domain.
  search?: (q: string) => string;
  domain: string;
};

// Resale marketplaces: tickets from other fans and brokers.
const RESALE: Site[] = [
  { name: "StubHub", domain: "stubhub.com", search: (q) => `https://www.stubhub.com/search?q=${q}` },
  { name: "Vivid Seats", domain: "vividseats.com", search: (q) => `https://www.vividseats.com/search?searchTerm=${q}` },
  { name: "SeatGeek", domain: "seatgeek.com", search: (q) => `https://seatgeek.com/search?search=${q}` },
  { name: "Gametime", domain: "gametime.co", search: (q) => `https://gametime.co/search?q=${q}` },
];

// Official sellers some venues use instead of Ticketmaster.
const PRIMARY: Site[] = [
  { name: "AXS", domain: "axs.com" },
  { name: "DICE", domain: "dice.fm" },
  { name: "See Tickets", domain: "seetickets.com" },
  { name: "Etix", domain: "etix.com" },
  { name: "Eventbrite", domain: "eventbrite.com" },
];

export type SearchLink = { name: string; url: string; viaGoogle: boolean };

function links(sites: Site[], query: string, connected: string[]): SearchLink[] {
  const q = encodeURIComponent(query);
  return sites
    .filter((s) => !connected.includes(s.name))
    .map((s) =>
      s.search
        ? { name: s.name, url: s.search(q), viaGoogle: false }
        : {
            name: s.name,
            url: `https://www.google.com/search?q=${encodeURIComponent(`${query} site:${s.domain}`)}`,
            viaGoogle: true,
          },
    );
}

export function otherSiteSearches(artistName: string, city: string | null, connected: string[]) {
  const query = [artistName, city].filter(Boolean).join(" ");
  return { resale: links(RESALE, query, connected), official: links(PRIMARY, query, connected) };
}
