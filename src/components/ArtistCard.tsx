import Link from "next/link";
import type { Artist } from "@/lib/types";

export function ArtistCard({ artist }: { artist: Artist }) {
  return (
    <Link
      href={`/artists/${artist.id}`}
      className="group overflow-hidden rounded-xl border border-zinc-200 bg-white transition hover:border-violet-400 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="aspect-video bg-gradient-to-br from-violet-500 to-fuchsia-500">
        {artist.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={artist.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl font-bold text-white/90">
            {artist.name.charAt(0)}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold group-hover:text-violet-600">{artist.name}</h3>
        <p className="text-sm text-zinc-500">
          {artist.genre ?? "Music"}
          {artist.upcomingShows > 0 &&
            ` · ${artist.upcomingShows} upcoming ${artist.upcomingShows === 1 ? "show" : "shows"}`}
        </p>
      </div>
    </Link>
  );
}
