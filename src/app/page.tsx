import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ArtistCard } from "@/components/ArtistCard";
import { DropList } from "@/components/DropList";
import { SearchBar } from "@/components/SearchBar";
import { getShows, popularArtists, searchArtists, upcomingDrops } from "@/lib/data";
import { groupDrops } from "@/lib/sales";
import { listFavorites } from "@/lib/user-data";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
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

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h2 className="text-xl font-semibold">{title}</h2>
      {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
    </div>
  );
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const q = (await searchParams).q?.trim() ?? "";

  const hero = (
    <section className="space-y-4 text-center">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Never miss a ticket drop</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Follow artists, track their tours, and find the cheapest tickets when they go on sale.
      </p>
      <div className="mx-auto max-w-xl">
        <SearchBar defaultValue={q} />
      </div>
    </section>
  );

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
              <ArtistCard key={a.id} artist={a} />
            ))}
          </div>
        </section>
      </div>
    );
  }

  const { userId } = await auth();
  const [mine, drops, popular] = await Promise.all([
    userId ? followedDrops(userId) : null,
    upcomingDrops(WEEK_MS),
    popularArtists(8),
  ]);

  return (
    <div className="space-y-12">
      {hero}

      {mine && (
        <section className="space-y-4">
          <SectionHeading
            title="Your upcoming ticket drops"
            subtitle="Presales and on-sales in the next 2 weeks for artists you follow"
          />
          {mine.drops.length ? (
            <DropList drops={mine.drops} />
          ) : (
            <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700">
              {mine.followsAnyone ? (
                "No ticket sales coming up for your artists in the next 2 weeks."
              ) : (
                <>Follow artists to see their ticket drops here. Try searching above.</>
              )}
            </p>
          )}
        </section>
      )}

      {drops.length > 0 && (
        <section className="space-y-4">
          <SectionHeading title="Tickets dropping this week" subtitle="Upcoming presales and on-sales for US concerts" />
          <DropList drops={drops} />
        </section>
      )}

      {popular.length > 0 && (
        <section className="space-y-4">
          <SectionHeading title="Popular artists on tour" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popular.map((a) => (
              <ArtistCard key={a.id} artist={a} />
            ))}
          </div>
        </section>
      )}

      {!userId && (
        <p className="text-center text-sm text-zinc-500">
          <Link href="/my-artists" className="text-violet-600 hover:underline">
            Sign in
          </Link>{" "}
          to follow artists and get alerts when their tickets go on sale.
        </p>
      )}
    </div>
  );
}
