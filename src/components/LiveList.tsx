import Link from "next/link";
import type { LiveArtist } from "@/lib/data";
import { fmtDateTime } from "@/lib/format";
import { ArtistThumb } from "./ArtistThumb";

export function LiveList({ items }: { items: LiveArtist[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((a) => (
        <li key={a.artistId} className="reveal min-w-0">
          <Link
            href={`/artists/${a.artistId}`}
            className="flex items-center gap-3 rounded-2xl bg-surface p-3 transition hover:bg-surface-2"
          >
            <ArtistThumb name={a.artistName} imageUrl={a.imageUrl} size="h-11 w-11" />
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{a.artistName}</span>
              <span className="block text-sm text-muted">
                {a.detail}
                {a.endsAt && ` · ends ${fmtDateTime(a.endsAt, a.timezone)}`}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
