import { currentUserId } from "@/auth";
import { Bell, CircleCheck, Clock, Ticket, UserPlus } from "lucide-react";
import Link from "next/link";
import { ArtistCard } from "@/components/ArtistCard";
import { AutoRefresh } from "@/components/AutoRefresh";
import { DropList } from "@/components/DropList";
import { SearchBar } from "@/components/SearchBar";
import { TourNudge } from "@/components/TourNudge";
import { Countdown } from "@/components/Countdown";
import { justAnnounced } from "@/lib/announced";
import { LiveList } from "@/components/LiveList";
import { getShows, liveSales, popularArtists, searchArtists, upcomingDrops } from "@/lib/data";
import { fmtDateTime } from "@/lib/format";
import { GENRES, isGenre } from "@/lib/genres";
import { groupDrops, type TicketDrop } from "@/lib/sales";
import { chip, chipOff, chipOn, linkAccent } from "@/lib/ui";
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

function SectionHeading({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
        {icon}
        {title}
      </h2>
      {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

const LIVE_DOT = (
  <span className="relative flex h-2.5 w-2.5" aria-hidden>
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-60 motion-reduce:hidden" />
    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-live" />
  </span>
);

const STEPS = [
  { icon: UserPlus, title: "Follow artists", text: "Search any artist and tap Follow." },
  { icon: Bell, title: "Get alerts", text: "We remind you before presales and sales start. Add TourTix to your Home Screen, or use Remind me for your calendar." },
  { icon: Ticket, title: "Buy from the seller", text: "We link you to Ticketmaster and other sites. TourTix doesn't sell tickets." },
];

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genre?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const genre = isGenre(params.genre) ? params.genre : undefined;

  const hero = (
    <section className="hero-glow space-y-6 pt-4 text-center sm:pt-10">
      <div className="space-y-3">
        <h1 className="enter text-balance text-4xl font-bold tracking-tight sm:text-5xl">Never miss a ticket drop</h1>
        <p className="enter mx-auto max-w-xl text-lg text-muted [--delay:80ms]">
          Every tour date, presale, and on-sale time for your artists, in one place. Free.
        </p>
      </div>
      <div className="enter relative z-10 mx-auto max-w-xl [--delay:160ms]">
        <SearchBar defaultValue={q} />
      </div>
      {!q && <TourNudge />}
      {!q && (
        <ol className="enter mx-auto grid max-w-3xl [--delay:240ms] gap-6 pt-4 text-left sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="flex gap-3 sm:flex-col">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <Icon size={20} aria-hidden />
              </span>
              <span>
                <span className="block font-semibold">
                  {i + 1}. {title}
                </span>
                <span className="block text-sm text-muted">{text}</span>
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
        <section className="reveal space-y-4">
          <h2 className="text-xl font-bold tracking-tight">
            {results.length ? `Results for “${q}”` : `No artists found for “${q}”`}
          </h2>
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 lg:grid-cols-4">
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
        <section className="space-y-3 rounded-3xl bg-surface p-5 sm:p-6">
          <h2 className="flex items-center gap-2 font-semibold">
            <Clock size={18} aria-hidden className="text-accent" /> Dropping in the next 24 hours
          </h2>
          <ul className="divide-y divide-line">
            {soon.map((d) => (
              <li key={d.artistId}>
                <Link
                  href={`/artists/${d.artistId}`}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2.5 transition hover:opacity-80"
                >
                  <span className="font-semibold">{d.artistName}</span>
                  <span className="text-sm font-medium">
                    <Countdown to={d.sale.start} label={d.sale.label} />
                    <span className="block text-right text-xs font-normal text-muted">
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
        className="stagger -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
        aria-label="Filter by genre"
      >
        {[undefined, ...GENRES].map((g) => (
          <Link
            key={g ?? "all"}
            href={genreLink(g)}
            scroll={false}
            className={`${chip} ${g === genre ? chipOn : chipOff}`}
          >
            {g ?? "All music"}
          </Link>
        ))}
      </nav>

      {mine && (
        <section className="reveal space-y-4">
          <SectionHeading
            title="Your upcoming ticket drops"
            subtitle="Presales and on-sales in the next 2 weeks for artists you follow"
          />
          {mine.drops.length ? (
            <DropList drops={mine.drops} />
          ) : (
            <p className="rounded-3xl bg-surface p-6 text-center text-sm text-muted">
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
        <section className="reveal space-y-4">
          <SectionHeading
            icon={LIVE_DOT}
            title="Presales happening now"
            subtitle="Open right now. Most need a code, sign-up, or membership."
          />
          <LiveList items={live.presales} />
        </section>
      )}

      {live.justOnSale.length > 0 && (
        <section className="reveal space-y-4">
          <SectionHeading
            icon={<CircleCheck size={20} aria-hidden className="text-live" />}
            title="Just went on sale"
            subtitle="General sales that opened in the last 2 days" />
          <LiveList items={live.justOnSale} />
        </section>
      )}

      {drops.length > 0 && (
        <section className="reveal space-y-4">
          <SectionHeading
            title={genre ? `${genre} tickets dropping this week` : "Tickets dropping this week"}
            subtitle="Upcoming presales and on-sales for US concerts"
          />
          <DropList drops={drops} />
        </section>
      )}

      {popular.length > 0 && (
        <section className="reveal space-y-4">
          <SectionHeading title={genre ? `Popular ${genre} artists on tour` : "Popular artists on tour"} />
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:gap-x-4 lg:grid-cols-4">
            {popular.map((a) => (
              <ArtistCard key={a.id} artist={a} nextSale={a.nextSale} following={followState(a.id)} />
            ))}
          </div>
        </section>
      )}

      {genre && drops.length === 0 && popular.length === 0 && (
        <p className="text-center text-muted">No {genre} tours found right now. Try another genre.</p>
      )}

      {announced.length > 0 && (
        <section className="reveal space-y-4">
          <SectionHeading title="Just announced" subtitle="New shows added in the last week by artists fans follow on TourTix" />
          <ul className="flex flex-wrap gap-2">
            {announced.map((a) => (
              <li key={a.artistId}>
                <Link
                  href={`/artists/${a.artistId}`}
                  className="inline-block rounded-full bg-surface px-4 py-2 text-sm transition hover:bg-surface-2"
                >
                  <span className="font-semibold">{a.artistName}</span>{" "}
                  <span className="text-muted">
                    +{a.newShows} {a.newShows === 1 ? "show" : "shows"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!userId && (
        <p className="text-center text-sm text-muted">
          <Link href="/my-artists" className={linkAccent}>
            Sign in
          </Link>{" "}
          to follow artists and get alerts when their tickets go on sale.
        </p>
      )}
    </div>
  );
}
