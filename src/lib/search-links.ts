// Plain links to other ticket sites. No API, no data fetched, no affiliate
// tracking: TourTix doesn't know whether these sites have the show, and the
// UI says so. Ticketmaster's API terms forbid earning revenue from pages
// built on its data, so never add affiliate parameters here.

type Site = {
  name: string;
  // The site's own search page, when its URL format is known. Otherwise we
  // link to a Google search limited to the site's domain.
  search?: (q: string) => string;
  // One or more domains for the Google fallback (e.g. a site's US and UK sites).
  domains: string[];
};

// Resale marketplaces: tickets from other fans and brokers.
const RESALE: Site[] = [
  { name: "StubHub", domains: ["stubhub.com"], search: (q) => `https://www.stubhub.com/search?q=${q}` },
  { name: "Vivid Seats", domains: ["vividseats.com"], search: (q) => `https://www.vividseats.com/search?searchTerm=${q}` },
  { name: "SeatGeek", domains: ["seatgeek.com"], search: (q) => `https://seatgeek.com/search?search=${q}` },
  { name: "Gametime", domains: ["gametime.co"], search: (q) => `https://gametime.co/search?q=${q}` },
];

// Official sellers some venues use instead of Ticketmaster.
const PRIMARY: Site[] = [
  { name: "AXS", domains: ["axs.com"] },
  { name: "DICE", domains: ["dice.fm"] },
  { name: "See Tickets", domains: ["seetickets.us", "seetickets.com"] },
  { name: "Etix", domains: ["etix.com"] },
  { name: "Eventbrite", domains: ["eventbrite.com"] },
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
            url: `https://www.google.com/search?q=${encodeURIComponent(
              `${query} ${s.domains.map((d) => `site:${d}`).join(" OR ")}`,
            )}`,
            viaGoogle: true,
          },
    );
}

export function otherSiteSearches(artistName: string, city: string | null, connected: string[]) {
  const query = [artistName, city].filter(Boolean).join(" ");
  return { resale: links(RESALE, query, connected), official: links(PRIMARY, query, connected) };
}
