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
export function fmtDateTime(iso: string, timeZone: string | null) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timeZone ?? "UTC",
    timeZoneName: "short",
  });
}
