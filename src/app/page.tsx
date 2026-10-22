import { currentUserId } from "@/auth";
import Link from "next/link";
import { ArtistCard } from "@/components/ArtistCard";
import { AutoRefresh } from "@/components/AutoRefresh";
import { DropList } from "@/components/DropList";
import { SearchBar } from "@/components/SearchBar";
import { Countdown } from "@/components/Countdown";
import { justAnnounced } from "@/lib/announced";
import { LiveList } from "@/components/LiveList";
import { getShows, liveSales, popularArtists, searchArtists, upcomingDrops } from "@/lib/data";
import { fmtDateTime } from "@/lib/format";
import { GENRES, isGenre } from "@/lib/genres";
import { groupDrops, type TicketDrop } from "@/lib/sales";
import { listFavorites } from "@/lib/user-data";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const TWO_WEEKS_MS = 2 * WEEK_MS;
// Followed artists checked for the "your drops" section, to bound API calls.
const MAX_FOLLOWED_CHECKED = 10;

async function followedDrops(userId: string) {
  const favs = (await listFavorites(userId)).slice(0, MAX_FOLLOWED_CHECKED);
  const items = await Promise.all(
    favs.map(async (f) => {
      const shows = await getShows({
        id: f.artistId,
        name: f.artistName,
        imageUrl: f.imageUrl,
        genre: null,
        upcomingShows: 0,
      }).catch((err) => {
        console.error(err);
        return [];
      });
      return shows.map((show) => ({
        artistId: f.artistId,
        artistName: f.artistName,
        imageUrl: f.imageUrl,
        show,
      }));
    }),
  );
  return { followsAnyone: favs.length > 0, drops: groupDrops(items.flat(), TWO_WEEKS_MS) };
}

function startingWithin(drops: TicketDrop[], ms: number) {
  const now = Date.now();
  return drops.filter((d) => Date.parse(d.sale.start) - now <= ms);
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold">{title}</h2>
      {subtitle && <p className="text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>}
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const genre = isGenre(params.genre) ? params.genre : undefined;

  const hero = (
    <section className="space-y-5 text-center">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Never miss a ticket drop</h1>
        <p className="text-lg text-zinc-700 dark:text-zinc-300">
          Every tour date, presale, and on-sale time for your artists, in one place. Free.
        </p>
      </div>
      <div className="mx-auto max-w-xl">
        <SearchBar defaultValue={q} />
      </div>
      {!q && (
        <ol className="mx-auto grid max-w-3xl gap-3 text-left sm:grid-cols-3">
          {[
            ["⭐", "Follow artists", "Search any artist and tap Follow."],
            ["🔔", "Get alerts", "We remind you before presales and general sales start."],
            ["🎟️", "Buy from the seller", "We link you to Ticketmaster and other sites. TourTix doesn't sell tickets."],
          ].map(([icon, title, text], i) => (
            <li key={title} className="flex gap-3 rounded-2xl bg-violet-50 p-4 dark:bg-violet-950/40">
              <span className="text-2xl" aria-hidden="true">
                {icon}
              </span>
              <span>
                <span className="block font-semibold">
                  {i + 1}. {title}
                </span>
                <span className="block text-sm text-zinc-700 dark:text-zinc-300">{text}</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );

  const userId = await currentUserId();
  const followedIds = userId ? new Set((await listFavorites(userId)).map((f) => f.artistId)) : null;
  const followState = (id: string) => (followedIds ? followedIds.has(id) : undefined);

  if (q) {
    const results = await searchArtists(q);
    return (
      <div className="space-y-8">
        {hero}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">
            {results.length ? `Results for “${q}”` : `No artists found for “${q}”`}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((a) => (
              <ArtistCard key={a.id} artist={a} following={followState(a.id)} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  const [mine, drops, popular, announced, live] = await Promise.all([
    userId ? followedDrops(userId) : null,
    upcomingDrops(WEEK_MS, 8, genre),
    popularArtists(8, genre),
    genre ? Promise.resolve([]) : justAnnounced(),
    liveSales(genre),
  ]);
  // Biggest drops starting within a day, for the banner at the top.
  const soon = startingWithin(drops, DAY_MS).slice(0, 3);
  const genreLink = (g?: string) => (g ? `/?genre=${encodeURIComponent(g)}` : "/");

  return (
    <div className="space-y-12">
      <AutoRefresh />
      {hero}

      {soon.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
          <h2 className="font-semibold">⏰ Dropping in the next 24 hours</h2>
          <ul className="space-y-2">
            {soon.map((d) => (
              <li key={d.artistId}>
                <Link
                  href={`/artists/${d.artistId}`}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 rounded-lg bg-white px-3 py-2 hover:bg-amber-100/50 dark:bg-zinc-900 dark:hover:bg-zinc-800"
                >
                  <span className="font-semibold">{d.artistName}</span>
                  <span className="text-sm">
                    <Countdown to={d.sale.start} label={d.sale.label} />
                    <span className="block text-right text-xs text-zinc-600 dark:text-zinc-400">
                      {fmtDateTime(d.sale.start, d.show.timezone)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
        aria-label="Filter by genre"
      >
        {[undefined, ...GENRES].map((g) => (
          <Link
            key={g ?? "all"}
            href={genreLink(g)}
            scroll={false}
            className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${
              g === genre
                ? "border-violet-600 bg-violet-600 text-white"
                : "border-zinc-300 hover:border-violet-500 dark:border-zinc-700"
            }`}
          >
            {g ?? "All music"}
          </Link>
        ))}
      </nav>

      {mine && (
        <section className="space-y-4">
          <SectionHeading
            title="Your upcoming ticket drops"
            subtitle="Presales and on-sales in the next 2 weeks for artists you follow"
          />
          {mine.drops.length ? (
            <DropList drops={mine.drops} />
          ) : (
            <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600 dark:text-zinc-400 dark:border-zinc-700">
              {mine.followsAnyone ? (
                "No ticket sales coming up for your artists in the next 2 weeks."
              ) : (
                <>Follow artists to see their ticket drops here. Try searching above.</>
              )}
            </p>
          )}
        </section>
      )}

      {live.presales.length > 0 && (
        <section className="space-y-4">
          <SectionHeading
            title="🔥 Presales happening now"
            subtitle="Open right now. Most need a code, sign-up, or membership."
          />
          <LiveList items={live.presales} />
        </section>
      )}

      {live.justOnSale.length > 0 && (
        <section className="space-y-4">
          <SectionHeading title="✅ Just went on sale" subtitle="General sales that opened in the last 2 days" />
          <LiveList items={live.justOnSale} />
        </section>
      )}

      {drops.length > 0 && (
        <section className="space-y-4">
          <SectionHeading
            title={genre ? `${genre} tickets dropping this week` : "Tickets dropping this week"}
            subtitle="Upcoming presales and on-sales for US concerts"
          />
          <DropList drops={drops} />
        </section>
      )}

      {popular.length > 0 && (
        <section className="space-y-4">
          <SectionHeading title={genre ? `Popular ${genre} artists on tour` : "Popular artists on tour"} />
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {popular.map((a) => (
              <ArtistCard key={a.id} artist={a} nextSale={a.nextSale} following={followState(a.id)} />
            ))}
          </div>
        </section>
      )}

      {genre && drops.length === 0 && popular.length === 0 && (
        <p className="text-center text-zinc-600 dark:text-zinc-400">No {genre} tours found right now. Try another genre.</p>
      )}

      {announced.length > 0 && (
        <section className="space-y-4">
          <SectionHeading title="Just announced" subtitle="New shows added in the last week by artists fans follow on TourTix" />
          <ul className="flex flex-wrap gap-2">
            {announced.map((a) => (
              <li key={a.artistId}>
                <Link
                  href={`/artists/${a.artistId}`}
                  className="inline-block rounded-full border border-zinc-300 px-4 py-2 text-sm hover:border-violet-500 dark:border-zinc-700"
                >
                  <span className="font-semibold">{a.artistName}</span>{" "}
                  <span className="text-zinc-600 dark:text-zinc-400">
                    +{a.newShows} {a.newShows === 1 ? "show" : "shows"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!userId && (
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/my-artists" className="text-violet-600 hover:underline">
            Sign in
          </Link>{" "}
          to follow artists and get alerts when their tickets go on sale.
        </p>
      )}
    </div>
  );
}
