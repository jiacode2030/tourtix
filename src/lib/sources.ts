// Ticket sellers the site currently pulls data from. Add an entry here
// whenever a new seller is connected so the site-wide notice stays accurate.
export const ticketSources: { name: string; enabled: boolean }[] = [
  { name: "Ticketmaster", enabled: !!process.env.TICKETMASTER_API_KEY },
];

export function activeSources(): string[] {
  return ticketSources.filter((s) => s.enabled).map((s) => s.name);
}
