import { auth } from "@clerk/nextjs/server";
import type { Metadata } from "next";
import Link from "next/link";
import { concerts } from "@/lib/data";
import { fmtDate } from "@/lib/format";
import { geohash } from "@/lib/geo";
import { usStates } from "@/lib/regions";
import { getProfile } from "@/lib/user-data";

export const metadata: Metadata = { title: "Concerts near you · TourTix" };

const field =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";

export default async function ConcertsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; state?: string; near?: string }>;
}) {
  const params = await searchParams;
  const city = params.city?.trim().slice(0, 100) ?? "";
  const state = usStates.some(([c]) => c === params.state) ? params.state : undefined;

  const { userId } = await auth();
  const profile = userId ? await getProfile(userId) : null;
  const canUseNearMe = profile?.lat != null && profile?.lng != null;
  const nearMe = params.near === "1" && canUseNearMe;

  let heading: string | null = null;
  let results: Awaited<ReturnType<typeof concerts>> = [];
  let failed = false;
  try {
    if (nearMe) {
      heading = `Concerts within ${profile!.radiusMiles} miles of you`;
      results = await concerts({
        geoPoint: geohash(profile!.lat!, profile!.lng!),
        radiusMiles: profile!.radiusMiles,
      });
    } else if (city) {
      heading = `Concerts in ${city}${state ? `, ${state}` : ""}`;
      results = await concerts({ city, stateCode: state });
    }
  } catch (err) {
    console.error(err);
    failed = true;
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Find concerts</h1>
        <p className="text-zinc-500">Browse shows in a city over the next 30 days.</p>
      </div>

      <form action="/concerts" className="flex flex-wrap gap-2">
        <input name="city" defaultValue={city} placeholder="City, e.g. Chicago" aria-label="City" className={`${field} min-w-0 flex-1`} required />
        <select name="state" defaultValue={state ?? ""} aria-label="State" className={field}>
          <option value="">Any state</option>
          {usStates.map(([code]) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-violet-600 px-5 py-2 font-medium text-white hover:bg-violet-700">
          Search
        </button>
      </form>
      <p className="text-sm">
        {canUseNearMe ? (
          <Link href="/concerts?near=1" className="font-medium text-violet-600 hover:underline">
            📍 Show concerts near me
          </Link>
        ) : (
          <span className="text-zinc-500">
            Want concerts near you?{" "}
            <Link href="/settings" className="text-violet-600 hover:underline">
              Share your location in Settings
            </Link>
            .
          </span>
        )}
      </p>

      {failed && <p className="text-rose-600">Couldn&apos;t load concerts right now. Try again in a minute.</p>}

      {heading && !failed && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold">
            {heading} <span className="text-zinc-400">({results.length})</span>
          </h2>
          {results.length ? (
            <ul className="divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
              {results.map(({ artist, show }) => (
                <li key={show.id}>
                  <Link
                    href={`/artists/${artist.id}#show-${show.id}`}
                    className="flex items-center gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <div className="w-28 shrink-0 text-sm font-semibold text-violet-600">{fmtDate(show.date)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{artist.name}</div>
                      <div className="truncate text-sm text-zinc-500">
                        {[show.venue, show.city].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                    <span className="text-sm text-violet-600">View →</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-zinc-500">No concerts found. Check the spelling or try a nearby bigger city.</p>
          )}
        </section>
      )}
    </div>
  );
}
