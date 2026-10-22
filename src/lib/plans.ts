// "I'm going": plans saved ONLY in the visitor's own browser (local storage).
// They are never sent to TourTix. Once the date has passed, the passport page
// can offer "Did you go?" and turn a plan into a stamp.

export type Plan = {
  id: string; // the show's id
  artistId: string | null;
  artistName: string;
  date: string; // YYYY-MM-DD
  city: string | null;
  venue: string | null;
};

export const PLANS_KEY = "tourtix-plans";
export const PLANS_EVENT = "tourtix:plans";
export const MAX_PLANS = 100;

// A show counts as over 36 hours after its date starts (UTC), so a late show in
// the US has finished before we ask "Did you go?".
const OVER_AFTER_MS = 36 * 60 * 60 * 1000;

const ID = /^[A-Za-z0-9_-]{1,80}$/;
const cap = (v: unknown, max: number): string | null => {
  if (typeof v !== "string") return null;
  const t = v.replace(/\s+/g, " ").trim().slice(0, max);
  return t || null;
};

function validDate(d: unknown): d is string {
  if (typeof d !== "string") return false;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return false;
  const t = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return t.getUTCFullYear() === +m[1] && t.getUTCMonth() === +m[2] - 1 && t.getUTCDate() === +m[3];
}

// Local storage can hold anything (old versions, edits, other scripts), so
// every field is checked and bad entries are dropped.
export function parsePlans(raw: string | null | undefined): Plan[] {
  if (!raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const seen = new Set<string>();
  const plans: Plan[] = [];
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    const artistName = cap(o.artistName, 100);
    if (typeof o.id !== "string" || !ID.test(o.id) || seen.has(o.id) || !artistName || !validDate(o.date)) continue;
    seen.add(o.id);
    plans.push({
      id: o.id,
      artistId: typeof o.artistId === "string" && ID.test(o.artistId) ? o.artistId : null,
      artistName,
      date: o.date,
      city: cap(o.city, 80),
      venue: cap(o.venue, 100),
    });
    if (plans.length >= MAX_PLANS) break;
  }
  return plans.sort((a, b) => a.date.localeCompare(b.date));
}

export const serializePlans = (plans: Plan[]) => JSON.stringify(plans);

export function addPlan(plans: Plan[], plan: Plan): Plan[] {
  const next = [...plans.filter((p) => p.id !== plan.id), plan].sort((a, b) => a.date.localeCompare(b.date));
  return next.slice(0, MAX_PLANS);
}

export const removePlan = (plans: Plan[], id: string): Plan[] => plans.filter((p) => p.id !== id);

export function splitPlans(plans: Plan[], now = Date.now()): { over: Plan[]; upcoming: Plan[] } {
  const cutoff = new Date(now - OVER_AFTER_MS).toISOString().slice(0, 10);
  return {
    over: plans.filter((p) => p.date <= cutoff),
    upcoming: plans.filter((p) => p.date > cutoff),
  };
}
