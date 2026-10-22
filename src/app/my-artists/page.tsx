import { currentUserId } from "@/auth";
import type { Metadata } from "next";
import Link from "next/link";
import { ArtistThumb } from "@/components/ArtistThumb";
import { ShowRow } from "@/components/ShowRow";
import { AutoRefresh } from "@/components/AutoRefresh";
import { GetStarted } from "@/components/GetStarted";
import { InstallButton } from "@/components/InstallButton";
import { SignInPrompt } from "@/components/SignInPrompt";
import { getShows } from "@/lib/data";
import { hasLocation, isNear } from "@/lib/geo";
import { chipOff, chipOn, linkAccent } from "@/lib/ui";
import { sharedSlotIds } from "@/lib/show-key";
import { getProfile, hasNotifications, hasStamps, listFavorites, locationOf } from "@/lib/user-data";

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
        <h1 className="text-3xl font-bold tracking-tight">Follow your favorite artists</h1>
        <p className="text-muted">Sign in to see all your artists&apos; upcoming shows in one place.</p>
        <SignInPrompt label="Sign in with Google" redirectTo="/my-artists" />
        <p className="mx-auto max-w-md text-sm text-muted">
          TourTix is free and doesn&apos;t sell tickets. We collect shows from ticket sites and link
          you to the seller to buy.
        </p>
      </div>
    );
  }

  const nearOnly = (await searchParams).near === "1";
  const [favs, profile, notifying, stamped] = await Promise.all([
    listFavorites(userId),
    getProfile(userId),
    hasNotifications(userId),
    hasStamps(userId),
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
        return { fav: f, shows: shows.slice(0, SHOWS_PER_ARTIST), total: shows.length, failed: false, shared: sharedSlotIds(shows) };
      } catch (err) {
        console.error(err);
        return { fav: f, shows: [], total: 0, failed: true, shared: new Set<string>() };
      }
    }),
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">My Artists</h1>
          <p className="text-muted">
            {favs.length} {favs.length === 1 ? "artist" : "artists"} followed
          </p>
        </div>
        {located ? (
          <div className="flex gap-1 rounded-full bg-surface p-1 text-sm font-medium">
            <Link
              href="/my-artists"
              className={`rounded-full px-4 py-2 ${!nearOnly ? chipOn : chipOff}`}
            >
              All shows
            </Link>
            <Link
              href="/my-artists?near=1"
              className={`rounded-full px-4 py-2 ${nearOnly ? chipOn : chipOff}`}
            >
              Near me
            </Link>
          </div>
        ) : (
          <Link href="/settings" className={`text-sm ${linkAccent}`}>
            Set your location to see shows near you →
          </Link>
        )}
      </div>

      <AutoRefresh />
      <GetStarted following={favs.length > 0} located={located} notifying={notifying} stamped={stamped} />
      <InstallButton />

      {favs.length === 0 && (
        <p className="rounded-3xl bg-surface p-8 text-center text-muted">
          You&apos;re not following anyone yet.{" "}
          <Link href="/" className={linkAccent}>
            Search for an artist
          </Link>{" "}
          and tap &ldquo;Follow&rdquo;.
        </p>
      )}

      {sections.map(({ fav, shows, total, failed, shared }) => (
        <section key={fav.artistId} className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <h2 className="min-w-0 text-xl font-bold tracking-tight">
              <Link href={`/artists/${fav.artistId}`} className="flex items-center gap-3 hover:underline">
                <ArtistThumb name={fav.artistName} imageUrl={fav.imageUrl} size="h-10 w-10" />
                <span className="truncate">{fav.artistName}</span>
              </Link>
            </h2>
            {total > shows.length && (
              <Link href={`/artists/${fav.artistId}`} className={`shrink-0 text-sm ${linkAccent}`}>
                See all {total} shows →
              </Link>
            )}
          </div>
          {shows.length ? (
            <ul className="stagger divide-y divide-line border-y border-line">
              {shows.map((s) => (
                <ShowRow
                  key={s.id}
                  show={s}
                  artistId={fav.artistId}
                  artistName={fav.artistName}
                  nearYou={isNear(s, loc)}
                  memberships={profile?.memberships ?? []}
                  listingName={shared.has(s.id) ? s.name : undefined}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">
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
