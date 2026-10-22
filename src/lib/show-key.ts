import type { Show } from "./types";

export const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Shows that share a date and venue with another listing, such as a regular
// ticket, a multi-day pass, or a travel package for the same night. These get
// their listing name shown so they don't look like duplicates.
export function sharedSlotIds(shows: Pick<Show, "id" | "date" | "venue">[]): Set<string> {
  const groups = new Map<string, string[]>();
  for (const s of shows) {
    const key = `${s.date}|${normalize(s.venue ?? "")}`;
    groups.set(key, [...(groups.get(key) ?? []), s.id]);
  }
  return new Set([...groups.values()].filter((ids) => ids.length > 1).flat());
}

// Same show on two sites = same date and same city.
export const showKey = (s: Pick<Show, "date" | "city">) =>
  `${s.date}|${normalize(s.city ?? "")}`;
