// Plain links to other ticket sites. No API, no data fetched, no affiliate
// tracking: TourTix doesn't know whether these sites have the show, and the
// UI says so. Ticketmaster's API terms forbid earning revenue from pages
// built on its data, so never add affiliate parameters here.

type Site = {
  name: string;
  // The site's own search page, when its URL format is known. Otherwise we
  // link to a Google search limited to the site's domain.
  search?: (query: string) => string;
  // One or more domains for the Google fallback (e.g. a site's US and UK sites).
  domains: string[];
};

const enc = encodeURIComponent;

// Resale marketplaces: tickets from other fans and brokers.
const RESALE: Site[] = [
  { name: "StubHub", domains: ["stubhub.com"], search: (query) => `https://www.stubhub.com/search?q=${enc(query)}` },
  { name: "Vivid Seats", domains: ["vividseats.com"], search: (query) => `https://www.vividseats.com/search?searchTerm=${enc(query)}` },
  { name: "SeatGeek", domains: ["seatgeek.com"], search: (query) => `https://seatgeek.com/search?search=${enc(query)}` },
  { name: "Gametime", domains: ["gametime.co"], search: (query) => `https://gametime.co/search?q=${enc(query)}` },
];

// Official sellers some venues use instead of Ticketmaster. Only sites that
// focus on concerts and don't let anyone post events: Etix (mostly fairs and
// small venues) and Eventbrite (open listings with reported fake concert
// tickets) were checked and left out on purpose.
const PRIMARY: Site[] = [
  { name: "AXS", domains: ["axs.com"] },
  { name: "DICE", domains: ["dice.fm"] },
  { name: "See Tickets", domains: ["seetickets.us", "seetickets.com"] },
];

export type SearchLink = { name: string; url: string; viaGoogle: boolean };

function links(sites: Site[], query: string, connected: string[]): SearchLink[] {
  return sites
    .filter((s) => !connected.includes(s.name))
    .map((s) =>
      s.search
        ? { name: s.name, url: s.search(query), viaGoogle: false }
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
  return {
    resale: links(RESALE, query, connected),
    official: links(PRIMARY, query, connected),
  };
}
