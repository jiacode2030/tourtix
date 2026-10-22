import Link from "next/link";
import { fmtDate, fmtDateTime } from "@/lib/format";
import type { TicketDrop } from "@/lib/sales";
import { ArtistThumb } from "./ArtistThumb";

export function DropList({ drops }: { drops: TicketDrop[] }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {drops.map((d) => {
        const place = [d.show.city, d.show.region ?? d.show.country].filter(Boolean).join(", ");
        return (
          <li key={d.artistId} className="reveal">
            <Link href={`/artists/${d.artistId}`} className="flex items-center gap-4 py-3 transition hover:opacity-80">
              <ArtistThumb name={d.artistName} imageUrl={d.imageUrl} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{d.artistName}</div>
                <div className="truncate text-sm text-muted">
                  {place || "Location TBA"} · {fmtDate(d.show.date)}
                  {d.moreShows > 0 && ` · +${d.moreShows} more`}
                </div>
                <div className="truncate text-sm font-medium text-accent sm:hidden">
                  {d.sale.label} · {fmtDateTime(d.sale.start, d.show.timezone)}
                </div>
              </div>
              <div className="hidden shrink-0 text-right sm:block">
                <div className="text-xs font-medium text-accent">{d.sale.label}</div>
                <div className="text-sm font-semibold">{fmtDateTime(d.sale.start, d.show.timezone)}</div>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
