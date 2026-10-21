import type { Metadata } from "next";
import Link from "next/link";
import { currentUserId } from "@/auth";
import { notFound } from "next/navigation";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShowRow } from "@/components/ShowRow";
import { SignInPrompt } from "@/components/SignInPrompt";
import { getArtist, getShows } from "@/lib/data";
import { fmtDate } from "@/lib/format";
import { hasLocation, isNear } from "@/lib/geo";
import { upcomingSaleStarts } from "@/lib/sales";
import type { Show } from "@/lib/types";
import { getProfile, hasNotifications, isFavorite, locationOf } from "@/lib/user-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const artist = await getArtist((await params).id).catch(() => null);
  if (!artist) return { title: "Artist not found" };
  const title = `${artist.name} Tour Dates & Ticket Drops`;
  const description = `See every upcoming ${artist.name} show, presale and on-sale times, and where to buy tickets. Get alerts when ${artist.name} tickets drop.`;
  return {
    title,
    description,
    alternates: { canonical: `/artists/${artist.id}` },
    openGraph: { title, description },
  };
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "onsale", label: "On sale now" },
  { key: "upcoming", label: "Sale coming up" },
  { key: "near", label: "Near me" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const FOREVER = Number.MAX_SAFE_INTEGER;

export default async function ArtistPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ filter?: string }>;
}) {
  const { id } = await params;
  const requested = (await searchParams).filter;
  const artist = await getArtist(id);
  if (!artist) notFound();
  const userId = await currentUserId();
  const [shows, following, profile, notifying] = await Promise.all([
    getShows(artist),
    userId ? isFavorite(userId, id) : false,
    userId ? getProfile(userId) : null,
    userId ? hasNotifications(userId) : false,
  ]);
  const loc = locationOf(profile);
  const located = hasLocation(loc);
  const filter: FilterKey =
    FILTERS.some((f) => f.key === requested) && (requested !== "near" || located)
      ? (requested as FilterKey)
      : "all";
  const matches: Record<FilterKey, (s: Show) => boolean> = {
    all: () => true,
    onsale: (s) => s.status === "onsale" || s.status === "presale",
    upcoming: (s) => upcomingSaleStarts(s, FOREVER).length > 0,
    near: (s) => isNear(s, loc),
  };
  const visible = shows.filter(matches[filter]);
  const nextShow = shows.find((s) => s.status !== "cancelled");

  return (
    <div className="space-y-6">
      <Link href="/" className="inline-block text-sm text-zinc-500 hover:text-violet-600">
        ← Back to search
      </Link>
      <div className="flex items-center gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-3xl font-bold text-white">
          {artist.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={artist.imageUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            artist.name.charAt(0)
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold">{artist.name}</h1>
          <p className="text-zinc-500">
            {artist.genre ?? "Music"}
            {nextShow && ` · Next show ${fmtDate(nextShow.date)}`}
          </p>
          <p className="text-xs text-zinc-400">
            Unofficial fan tool. Not affiliated with {artist.name} or their team.
          </p>
        </div>
      </div>
      <div className="space-y-3">
        {userId ? (
          <FavoriteButton artistId={artist.id} isFavorite={following} />
        ) : (
          <SignInPrompt label="☆ Sign in to follow" redirectTo={`/artists/${artist.id}`} />
        )}
        {following && !notifying && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/40">
            <span className="flex-1">
              🔔 Want an alert when {artist.name} announces shows or tickets go on sale?
            </span>
            <Link
              href="/settings#notifications"
              className="rounded-lg bg-violet-600 px-3 py-1.5 font-medium text-white hover:bg-violet-700"
            >
              Turn on notifications
            </Link>
          </div>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          Upcoming shows <span className="text-zinc-400">({shows.length})</span>
        </h2>
        {shows.length > 0 && (
          <nav className="flex flex-wrap gap-2" aria-label="Filter shows">
            {FILTERS.filter((f) => f.key !== "near" || located).map((f) => (
              <Link
                key={f.key}
                href={f.key === "all" ? `/artists/${artist.id}` : `/artists/${artist.id}?filter=${f.key}`}
                scroll={false}
                className={`rounded-full border px-3 py-1 text-sm ${
                  filter === f.key
                    ? "border-violet-600 bg-violet-600 text-white"
                    : "border-zinc-300 hover:border-violet-500 dark:border-zinc-700"
                }`}
              >
                {f.label} ({shows.filter(matches[f.key]).length})
              </Link>
            ))}
          </nav>
        )}
        {shows.length > 0 && (
          <p className="text-sm text-zinc-500">
            Show info refreshes about every 5 minutes. Always check the date, seats, and final price
            (including fees) on the seller&apos;s site before you buy.
          </p>
        )}
        {visible.length ? (
          <ul className="space-y-3">
            {visible.map((s) => (
              <ShowRow
                key={s.id}
                show={s}
                artistId={artist.id}
                artistName={artist.name}
                nearYou={isNear(s, loc)}
              />
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-zinc-500 dark:border-zinc-700">
            {shows.length ? "No shows match this filter." : "No upcoming shows right now."}
          </p>
        )}
      </section>
    </div>
  );
}
