export function fmtDate(d: string | null) {
  if (!d) return "Date TBA";
  return new Date(`${d}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Sale times are shown in the venue's time zone with its abbreviation,
// since the server's own time zone means nothing to visitors.
export function fmtDateTime(iso: string, timeZone: string | null, now = Date.now()) {
  // A date months away (or long past) gets its year, so "ends Aug 10" can't be
  // mistaken for last August.
  const far = Math.abs(Date.parse(iso) - now) > 150 * 24 * 60 * 60 * 1000;
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    ...(far ? { year: "numeric" as const } : {}),
    hour: "numeric",
    minute: "2-digit",
    timeZone: timeZone ?? "UTC",
    timeZoneName: "short",
  });
}

// Converts a wall-clock date/time in an IANA time zone to a UTC Date.
export function zonedTimeToUtc(date: string, time: string, timeZone: string): Date {
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi, s] = time.split(":").map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi, s || 0);
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
      .formatToParts(new Date(guess))
      .map((p) => [p.type, p.value]),
  );
  const asIfUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return new Date(guess - (asIfUtc - guess));
}
