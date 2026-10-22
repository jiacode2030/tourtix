// A small per-visitor limit for pages that spend our ticket-data API quota
// (search and suggestions). Without one, anyone could script thousands of
// different searches and use up the daily quota for everybody.
//
// Counts live in memory on each server instance, so it's a guard against
// scripted abuse, not an exact meter. Normal typing never gets near it.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function allow(key: string, limit: number, windowMs: number, now = Date.now()): boolean {
  if (buckets.size > 5000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
    if (buckets.size > 5000) buckets.clear(); // under attack: start fresh rather than grow forever
  }
  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  b.count++;
  return b.count <= limit;
}

// The visitor's address as seen by the hosting platform (first entry is the client).
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || headers.get("x-real-ip") || "unknown";
}

export const SEARCH_LIMIT = { limit: 60, windowMs: 60_000 };
