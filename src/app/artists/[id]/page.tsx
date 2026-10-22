import type { Metadata } from "next";
import Link from "next/link";
import { currentUserId } from "@/auth";
import { notFound } from "next/navigation";
import { AutoRefresh } from "@/components/AutoRefresh";
import { Bell, Plus } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { LastChecked } from "@/components/LastChecked";
import { LivePresales } from "@/components/LivePresales";
import { NextDropCard } from "@/components/NextDropCard";
import { ShowRow } from "@/components/ShowRow";
import { SignInPrompt } from "@/components/SignInPrompt";
import { getArtist, getShows } from "@/lib/data";
import { nextDrop, saleTimeline, tourSummary } from "@/lib/drops";
import { fmtDate } from "@/lib/format";
import { livePresales } from "@/lib/live";
import { hasLocation, isNear } from "@/lib/geo";
import { upcomingSaleStarts } from "@/lib/sales";
import type { Show } from "@/lib/types";
import { btnSecondary, STAGE_LIGHTS } from "@/lib/ui";
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

// Shown when Ticketmaster has no artist photo.
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
  // Signed-in users without a profile row yet get an empty list, which shows the Settings prompt.
  const memberships = userId ? (profile?.memberships ?? []) : undefined;
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
  const checkedAt = new Date().toISOString();
  const drop = nextDrop(shows, loc);
  const liveNow = livePresales(shows);
  const covered = new Set(drop?.shows.map((d) => d.show.id));
  const summary = tourSummary(shows, loc);
  const sameYear = summary.firstDate?.slice(0, 4) === summary.lastDate?.slice(0, 4);
  const range = (d: string | null) =>
    d ? new Date(`${d}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";
  const nextShow = shows.find((s) => s.status !== "cancelled");

  const metaLine = [
    artist.genre,
    summary.count ? `${summary.count} ${summary.count === 1 ? "show" : "shows"}` : null,
    summary.count > 1 && summary.firstDate
      ? `${sameYear ? range(summary.firstDate).replace(/, \d{4}$/, "") : range(summary.firstDate)} – ${range(summary.lastDate)}`
      : nextShow
        ? fmtDate(nextShow.date)
        : null,
    located && summary.near ? `${summary.near} near you` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="space-y-8">
      <AutoRefresh />

      {/* Photo header: rounded card in light mode, full-bleed fade in dark mode. */}
      <header className="relative -mx-4 -mt-6 sm:mx-0 sm:mt-0">
        <div
          className="relative mx-4 mt-4 h-56 overflow-hidden rounded-3xl bg-surface bg-cover bg-center sm:mx-0 sm:h-72 dark:mx-0 dark:mt-0 dark:h-80 dark:rounded-none sm:dark:rounded-3xl"
          style={
            artist.imageUrl
              ? { backgroundImage: `url(${JSON.stringify(artist.imageUrl)})` }
              : { background: STAGE_LIGHTS }
          }
          role="img"
          aria-label={artist.imageUrl ? `${artist.name}` : undefined}
        >
          <div className="absolute inset-0 hidden bg-gradient-to-b from-transparent via-bg/30 to-bg dark:block" />
        </div>
        <div className="px-4 pt-5 sm:px-0 dark:absolute dark:inset-x-0 dark:bottom-0 dark:pb-4 sm:dark:px-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">{artist.name}</h1>
          {metaLine && <p className="mt-1 text-[15px] text-muted">{metaLine}</p>}
        </div>
      </header>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-3">
          {userId ? (
            <FavoriteButton artistId={artist.id} isFavorite={following} />
          ) : (
            <SignInPrompt label="Follow" icon={<Plus size={18} aria-hidden />} redirectTo={`/artists/${artist.id}`} />
          )}
          <Link href="/settings#notifications" className={btnSecondary}>
            <Bell size={18} aria-hidden /> Alerts
          </Link>
        </div>
        {following && !notifying && (
          <Link
            href="/settings#notifications"
            className="flex items-center gap-3 rounded-2xl bg-surface p-4 text-sm hover:bg-surface-2"
          >
            <Bell size={20} aria-hidden className="shrink-0 text-accent" />
            <span className="flex-1">
              Get an alert when {artist.name} announces shows or tickets go on sale.
              <span className="block font-semibold text-accent">Turn on notifications</span>
              <span className="mt-1 block text-xs text-muted">
                Tip: add TourTix to your Home Screen (needed on iPhone), or tap &ldquo;Remind me&rdquo; on a sale to add it to your calendar.
              </span>
            </span>
          </Link>
        )}
        <p className="text-xs text-muted">Unofficial fan tool, not affiliated with {artist.name}.</p>
      </div>

      {liveNow.length > 0 && <LivePresales sales={liveNow} memberships={memberships} />}
      {drop && <NextDropCard artistName={artist.name} drop={drop} timeline={saleTimeline(drop.shows.map((d) => d.show))} />}

      <section className="reveal space-y-3">
        <h2 className="text-xl font-semibold">Upcoming shows</h2>
        {shows.length > 0 && (
          <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" aria-label="Filter shows">
            {FILTERS.filter((f) => f.key !== "near" || located).map((f) => (
              <Link
                key={f.key}
                href={f.key === "all" ? `/artists/${artist.id}` : `/artists/${artist.id}?filter=${f.key}`}
                scroll={false}
                className={`flex min-h-9 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-sm font-medium ${
                  filter === f.key ? "bg-cta text-on-cta" : "bg-surface text-fg hover:bg-surface-2"
                }`}
              >
                {f.label} · {shows.filter(matches[f.key]).length}
              </Link>
            ))}
          </nav>
        )}
        {visible.length ? (
          <ul className="divide-y divide-line border-y border-line">
            {visible.map((s) => (
              <ShowRow
                key={s.id}
                show={s}
                artistId={artist.id}
                artistName={artist.name}
                nearYou={isNear(s, loc)}
                coveredByDrop={covered.has(s.id)}
                memberships={memberships}
              />
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl bg-surface p-6 text-center text-muted">
            {shows.length ? "No shows match this filter." : "No upcoming shows right now."}
          </p>
        )}
        {shows.length > 0 && (
          <p className="text-xs text-muted">
            Tap a show for tickets and details. You buy on the seller&apos;s website; TourTix
            doesn&apos;t sell tickets. Updates automatically (up to 5 min old).{" "}
            <LastChecked at={checkedAt} />
          </p>
        )}
      </section>
    </div>
  );
}
