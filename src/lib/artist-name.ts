// Ticketmaster artist names are occasionally junk (a link or an ID where a name
// should be) or a stylization that reads like a typo. This returns the name to
// show, or null when there's nothing usable to show.

// Official stylizations that casual readers take for typos, shown the way
// everyone writes them. Search still finds either spelling.
const DISPLAY_NAMES: Record<string, string> = {
  "JAŸ-Z": "JAY-Z",
};

export function cleanArtistName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.replace(/\s+/g, " ").trim();
  if (!name) return null;
  // A path or web address, e.g. "/artists/K8vZ917Gbf0" or "https://...".
  if (/^(\/|https?:|www\.)/i.test(name) || /^artists\/[\w-]+$/i.test(name)) return null;
  // A bare Ticketmaster ID, e.g. "K8vZ917Gbf0".
  if (/^[A-Za-z0-9_-]{10,}$/.test(name) && /\d/.test(name) && /[A-Za-z]/.test(name) && !/\s/.test(name)) return null;
  return DISPLAY_NAMES[name] ?? name;
}
