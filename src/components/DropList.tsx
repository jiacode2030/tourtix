import Link from "next/link";
import { fmtDate, fmtDateTime } from "@/lib/format";
import type { TicketDrop } from "@/lib/sales";

export function DropList({ drops }: { drops: TicketDrop[] }) {
  return (
    <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
      {drops.map((d) => {
        const place = [d.show.city, d.show.region ?? d.show.country].filter(Boolean).join(", ");
        return (
          <li key={d.artistId}>
            <Link
              href={`/artists/${d.artistId}`}
              className="flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg font-bold text-white">
                {d.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.imageUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  d.artistName.charAt(0)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{d.artistName}</div>
                <div className="truncate text-sm text-zinc-500">
                  {place || "Location TBA"} · {fmtDate(d.show.date)}
                  {d.moreShows > 0 && ` · +${d.moreShows} more`}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <div className="text-xs font-medium text-amber-700 dark:text-amber-400">{d.sale.label}</div>
                <div className="text-sm font-semibold">{fmtDateTime(d.sale.start, d.show.timezone)}</div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
