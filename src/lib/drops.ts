import { isNear, type UserLocation } from "./geo";
import { presaleKey } from "./presale-names";
import { realPresales, upcomingSaleStarts } from "./sales";
import type { Show } from "./types";

const FOREVER = Number.MAX_SAFE_INTEGER;

// Wall-clock time in the venue's zone, e.g. "Thu, Oct 22, 12:00 PM".
export function localKey(iso: string, timeZone: string | null) {
  return new Date(iso).toLocaleString("en-US", {
    timeZone: timeZone ?? "UTC",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export type DropShow = { show: Show; start: string };

export type NextDrop = {
  label: string;
  // Same local time at every venue in the group, e.g. "Thu, Oct 22, 12:00 PM".
  localTime: string;
  // Shows in this drop, earliest absolute start first.
  shows: DropShow[];
  // The show whose start matters most to this viewer: the nearest one if we
  // know their location, otherwise the earliest.
  focus: DropShow;
};

// The artist's next ticket drop: the soonest upcoming sale, plus every other
// show with the same sale type at the same local time (tours usually open all
// cities at e.g. "12 PM local", which are different moments across zones).
export function nextDrop(shows: Show[], loc: UserLocation | null, now = Date.now()): NextDrop | null {
  const starts = shows.flatMap((show) =>
    upcomingSaleStarts(show, FOREVER, now).map((sale) => ({
      show,
      label: sale.label,
      start: sale.start,
      local: localKey(sale.start, show.timezone),
    })),
  );
  if (!starts.length) return null;
  starts.sort((a, b) => a.start.localeCompare(b.start));
  const first = starts[0];
  const group = starts.filter((s) => presaleKey(s.label) === presaleKey(first.label) && s.local === first.local);
  const seen = new Set<string>();
  const dropShows = group
    .filter((s) => !seen.has(s.show.id) && seen.add(s.show.id))
    .map((s) => ({ show: s.show, start: s.start }));
  const near = loc ? dropShows.find((d) => isNear(d.show, loc)) : undefined;
  return { label: first.label, localTime: first.local, shows: dropShows, focus: near ?? dropShows[0] };
}

export type SaleStage = { label: string; state: "ended" | "live" | "upcoming"; start: string | null };

// Each sale type across the tour (presales, then general sale) and whether it
// has ended, is live, or is coming up, judged across all of the artist's shows.
export function saleTimeline(shows: Show[], now = Date.now()): SaleStage[] {
  const stages = new Map<string, { label: string; starts: number[]; live: boolean; ended: boolean }>();
  const note = (label: string, start: string | null, end: string | null) => {
    if (!start) return;
    const s = Date.parse(start);
    const e = end ? Date.parse(end) : null;
    const key = presaleKey(label);
    const entry = stages.get(key) ?? { label, starts: [], live: false, ended: false };
    entry.starts.push(s);
    if (s <= now && (e == null || e > now)) entry.live = true;
    if (e != null && e <= now) entry.ended = true;
    stages.set(key, entry);
  };
  for (const show of shows) {
    if (show.status === "cancelled" || show.status === "postponed") continue;
    for (const p of realPresales(show)) note(p.name, p.start, p.end);
    note("General sale", show.publicSaleStart, null);
  }
  return [...stages.values()]
    .map((e) => {
      const label = e.label;
      const future = e.starts.filter((s) => s > now);
      const state: SaleStage["state"] = e.live ? "live" : future.length ? "upcoming" : "ended";
      const start = future.length ? new Date(Math.min(...future)).toISOString() : null;
      return { label, state, start, first: Math.min(...e.starts) };
    })
    .sort((a, b) => a.first - b.first)
    .map(({ label, state, start }) => ({ label, state, start }));
}

export type TourSummary = { count: number; firstDate: string | null; lastDate: string | null; near: number };

export function tourSummary(shows: Show[], loc: UserLocation | null): TourSummary {
  const live = shows.filter((s) => s.status !== "cancelled");
  const dates = live.map((s) => s.date).filter((d): d is string => !!d).sort();
  return {
    count: live.length,
    firstDate: dates[0] ?? null,
    lastDate: dates.at(-1) ?? null,
    near: loc ? live.filter((s) => isNear(s, loc)).length : 0,
  };
}
