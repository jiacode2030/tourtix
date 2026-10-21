import type { Show } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

function fmtDate(d: string | null) {
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
function fmtDateTime(iso: string, timeZone: string | null) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timeZone ?? "UTC",
    timeZoneName: "short",
  });
}

function saleNote(show: Show): string | null {
  const now = new Date();
  if (show.status === "announced") {
    const next = show.presales
      .filter((p) => p.start && new Date(p.start) > now)
      .sort((a, b) => a.start!.localeCompare(b.start!))[0];
    if (next?.start) return `${next.name} starts ${fmtDateTime(next.start, show.timezone)}`;
    if (show.publicSaleStart) return `On sale ${fmtDateTime(show.publicSaleStart, show.timezone)}`;
    return "On-sale date TBA";
  }
  if (show.status === "presale" && show.publicSaleStart) {
    return `General sale ${fmtDateTime(show.publicSaleStart, show.timezone)}`;
  }
  return null;
}

export function ShowRow({ show }: { show: Show }) {
  const place = [show.city, show.region ?? show.country].filter(Boolean).join(", ");
  const note = saleNote(show);

  return (
    <li className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center dark:border-zinc-800 dark:bg-zinc-900">
      <div className="w-32 shrink-0 text-sm font-semibold text-violet-600">{fmtDate(show.date)}</div>
      <div className="min-w-0 flex-1">
        <div className="font-medium">{place || "Location TBA"}</div>
        <div className="truncate text-sm text-zinc-500">{show.venue}</div>
        {note && <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{note}</div>}
      </div>
      <StatusBadge status={show.status} />
      {show.url && (show.status === "onsale" || show.status === "presale") && (
        <a
          href={show.url}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-violet-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-violet-700"
        >
          Buy on Ticketmaster
        </a>
      )}
    </li>
  );
}
