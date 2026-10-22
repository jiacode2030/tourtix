import Link from "next/link";
import type { Artist } from "@/lib/types";
import { STAGE_LIGHTS } from "@/lib/ui";
import { Countdown } from "./Countdown";
import { FollowStar } from "./FollowStar";

export function ArtistCard({
  artist,
  nextSale = null,
  following,
}: {
  artist: Artist;
  nextSale?: { label: string; start: string } | null;
  // Whether the signed-in user follows this artist; undefined when signed out.
  following?: boolean;
}) {
  return (
    <div className="relative">
      <Link href={`/artists/${artist.id}`} className="group block h-full">
        <div
          className="aspect-[4/3] overflow-hidden rounded-2xl bg-surface"
          style={artist.imageUrl ? undefined : { background: STAGE_LIGHTS }}
        >
          {artist.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={artist.imageUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl font-bold text-white/90">
              {artist.name.charAt(0)}
            </div>
          )}
        </div>
        <div className="pt-2.5">
          <h3 className="truncate font-semibold group-hover:underline">{artist.name}</h3>
          <p className="text-sm text-muted">
            {artist.genre ?? "Music"}
            {artist.upcomingShows > 0 &&
              ` · ${artist.upcomingShows} ${artist.upcomingShows === 1 ? "show" : "shows"}`}
          </p>
          {nextSale && (
            <p className="mt-0.5 text-sm font-medium text-accent">
              <Countdown to={nextSale.start} label={nextSale.label} />
            </p>
          )}
        </div>
      </Link>
      {following !== undefined && (
        <div className="absolute right-2 top-2">
          <FollowStar artistId={artist.id} artistName={artist.name} isFavorite={following} />
        </div>
      )}
    </div>
  );
}
