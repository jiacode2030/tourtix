import Link from "next/link";
import type { LiveArtist } from "@/lib/data";
import { fmtDateTime } from "@/lib/format";

export function LiveList({ items }: { items: LiveArtist[] }) {
  return (
    <ul className="grid gap-2 sm:grid-cols-2">
      {items.map((a) => (
        <li key={a.artistId}>
          <Link
            href={`/artists/${a.artistId}`}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3 hover:border-violet-400 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 font-bold text-white">
              {a.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                a.artistName.charAt(0)
              )}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{a.artistName}</span>
              <span className="block truncate text-sm text-zinc-500">
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
