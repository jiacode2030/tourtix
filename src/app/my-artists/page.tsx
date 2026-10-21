import { currentUserId } from "@/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { ShowRow } from "@/components/ShowRow";
import { GetStarted } from "@/components/GetStarted";
import { InstallButton } from "@/components/InstallButton";
import { SignInPrompt } from "@/components/SignInPrompt";
import { getShows } from "@/lib/data";
import { hasLocation, isNear } from "@/lib/geo";
import { getProfile, hasNotifications, listFavorites, locationOf } from "@/lib/user-data";

export const metadata: Metadata = { title: "My Artists" };

const SHOWS_PER_ARTIST = 5;

export default async function MyArtistsPage({
  searchParams,
}: {
  searchParams: Promise<{ near?: string }>;
}) {
  const userId = await currentUserId();
  if (!userId) {
    return (
      <div className="space-y-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Follow your favorite artists</h1>
        <p className="text-zinc-500">Sign in to see all your artists&apos; upcoming shows in one place.</p>
        <SignInPrompt label="Sign in with Google" redirectTo="/my-artists" />
        <p className="mx-auto max-w-md text-sm text-zinc-500">
          TourTix is free and doesn&apos;t sell tickets. We collect shows from ticket sites and link
          you to the seller to buy.
        </p>
      </div>
    );
  }

  const nearOnly = (await searchParams).near === "1";
  const [favs, profile, notifying] = await Promise.all([
    listFavorites(userId),
    getProfile(userId),
    hasNotifications(userId),
  ]);
  const loc = locationOf(profile);
  const located = hasLocation(loc);

  const sections = await Promise.all(
    favs.map(async (f) => {
      try {
        let shows = await getShows({
          id: f.artistId,
          name: f.artistName,
          imageUrl: f.imageUrl,
          genre: null,
          upcomingShows: 0,
        });
        if (nearOnly && located) shows = shows.filter((s) => isNear(s, loc));
        return { fav: f, shows: shows.slice(0, SHOWS_PER_ARTIST), total: shows.length, failed: false };
      } catch (err) {
        console.error(err);
        return { fav: f, shows: [], total: 0, failed: true };
      }
    }),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Artists</h1>
          <p className="text-zinc-500">
            {favs.length} {favs.length === 1 ? "artist" : "artists"} followed
          </p>
        </div>
        {located ? (
          <div className="flex rounded-lg border border-zinc-200 p-1 text-sm dark:border-zinc-800">
            <Link
              href="/my-artists"
              className={`rounded-md px-3 py-1 ${!nearOnly ? "bg-violet-600 text-white" : ""}`}
            >
              All shows
            </Link>
            <Link
              href="/my-artists?near=1"
              className={`rounded-md px-3 py-1 ${nearOnly ? "bg-violet-600 text-white" : ""}`}
            >
              Near me
            </Link>
          </div>
        ) : (
          <Link href="/settings" className="text-sm text-violet-600 hover:underline">
            Set your location to see shows near you →
          </Link>
        )}
      </div>

      <GetStarted following={favs.length > 0} located={located} notifying={notifying} />
      <InstallButton />

      {favs.length === 0 && (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          You&apos;re not following anyone yet.{" "}
          <Link href="/" className="text-violet-600 hover:underline">
            Search for an artist
          </Link>{" "}
          and tap &ldquo;Follow artist&rdquo;.
        </p>
      )}

      {sections.map(({ fav, shows, total, failed }) => (
        <section key={fav.artistId} className="space-y-3">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-xl font-semibold">
              <Link href={`/artists/${fav.artistId}`} className="hover:text-violet-600">
                {fav.artistName}
              </Link>
            </h2>
            {total > shows.length && (
              <Link href={`/artists/${fav.artistId}`} className="text-sm text-violet-600 hover:underline">
                See all {total} shows →
              </Link>
            )}
          </div>
          {shows.length ? (
            <ul className="space-y-3">
              {shows.map((s) => (
                <ShowRow
                  key={s.id}
                  show={s}
                  artistId={fav.artistId}
                  artistName={fav.artistName}
                  nearYou={isNear(s, loc)}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-zinc-500">
              {failed
                ? "Couldn't load shows right now. Try again in a minute."
                : nearOnly
                  ? "No upcoming shows near you."
                  : "No upcoming shows right now."}
            </p>
          )}
        </section>
      ))}
    </div>
  );
}
