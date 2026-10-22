// Concert passport: private "I went" stamps. These rules decide what a stamp
// may contain; the stamps themselves are only ever shown to their owner.

export const MAX_STAMPS = 500;

export type Stamp = {
  id: number;
  artistId: string | null;
  artistName: string;
  imageUrl: string | null;
  venue: string | null;
  city: string | null;
  // YYYY-MM-DD, the day of the concert
  eventDate: string;
};

export type StampInput = {
  artistName: string;
  artistId: string | null;
  eventDate: string;
  city: string | null;
  venue: string | null;
};

export type StampError = "name" | "date" | "future" | "old";

const DAY_MS = 24 * 60 * 60 * 1000;

// Collapses whitespace and removes control characters.
const tidy = (v: unknown, max: number): string =>
  String(v ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

export function parseStamp(
  raw: { artistName?: unknown; artistId?: unknown; date?: unknown; city?: unknown; venue?: unknown },
  now = Date.now(),
): { ok: true; value: StampInput } | { ok: false; error: StampError } {
  const artistName = tidy(raw.artistName, 100);
  if (!artistName) return { ok: false, error: "name" };

  const date = String(raw.date ?? "").trim();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return { ok: false, error: "date" };
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const back = new Date(t);
  // Reject things like 2026-02-31 that JavaScript would quietly roll over.
  if (back.getUTCFullYear() !== +m[1] || back.getUTCMonth() !== +m[2] - 1 || back.getUTCDate() !== +m[3]) {
    return { ok: false, error: "date" };
  }
  if (+m[1] < 1950) return { ok: false, error: "old" };
  // A day of slack covers time zones. Stamps are for concerts you've been to.
  if (t > now + DAY_MS) return { ok: false, error: "future" };

  const artistId = typeof raw.artistId === "string" && /^[A-Za-z0-9_-]{1,40}$/.test(raw.artistId) ? raw.artistId : null;
  return {
    ok: true,
    value: {
      artistName,
      artistId,
      eventDate: date,
      city: tidy(raw.city, 80) || null,
      venue: tidy(raw.venue, 100) || null,
    },
  };
}

export type PassportStats = {
  concerts: number;
  artists: number;
  cities: number;
  firstYear: number | null;
  lastYear: number | null;
  topArtist: { name: string; count: number } | null;
};

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function passportStats(stamps: Pick<Stamp, "artistName" | "city" | "eventDate">[]): PassportStats {
  const artists = new Map<string, { name: string; count: number }>();
  const cities = new Set<string>();
  const years: number[] = [];
  for (const s of stamps) {
    const key = norm(s.artistName);
    const have = artists.get(key);
    artists.set(key, { name: have?.name ?? s.artistName, count: (have?.count ?? 0) + 1 });
    if (s.city) cities.add(norm(s.city));
    years.push(+s.eventDate.slice(0, 4));
  }
  const top = [...artists.values()].sort((a, b) => b.count - a.count)[0];
  return {
    concerts: stamps.length,
    artists: artists.size,
    cities: cities.size,
    firstYear: years.length ? Math.min(...years) : null,
    lastYear: years.length ? Math.max(...years) : null,
    // "Most seen" only means something once you've seen someone more than once.
    topArtist: top && top.count > 1 ? top : null,
  };
}

// "Oct 22, 2026" from a YYYY-MM-DD string, without time zone surprises.
export function stampDate(eventDate: string, style: "short" | "stamp" = "short"): string {
  const d = new Date(`${eventDate}T12:00:00Z`);
  if (style === "stamp") {
    const mon = d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }).toUpperCase();
    return `${mon} ${d.getUTCDate()} '${String(d.getUTCFullYear()).slice(2)}`;
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
}
