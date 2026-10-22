import { currentUserId } from "@/auth";
import type { Metadata } from "next";
import { ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { concerts } from "@/lib/data";
import { fmtDate } from "@/lib/format";
import { geohash } from "@/lib/geo";
import { usStates } from "@/lib/regions";
import { btnPrimary, input, linkAccent } from "@/lib/ui";
import { getProfile } from "@/lib/user-data";

export const metadata: Metadata = { title: "Concerts near you" };

function datePart(date: string, opts: Intl.DateTimeFormatOptions) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
}


export default async function ConcertsPage({
  searchParams,
}: {
  searchParams: Promise<{ city?: string; state?: string; near?: string }>;
}) {
  const params = await searchParams;
  const city = params.city?.trim().slice(0, 100) ?? "";
  const state = usStates.some(([c]) => c === params.state) ? params.state : undefined;

  const userId = await currentUserId();
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
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Find concerts</h1>
        <p className="text-muted">Browse shows in a city over the next 30 days.</p>
      </div>

      <form action="/concerts" className="flex flex-wrap gap-2">
        <input name="city" defaultValue={city} placeholder="City, e.g. Chicago" aria-label="City" className={`${input} min-w-0 flex-1 basis-48`} required />
        <select name="state" defaultValue={state ?? ""} aria-label="State" className={`${input} w-auto`}>
          <option value="">Any state</option>
          {usStates.map(([code]) => (
            <option key={code} value={code}>
              {code}
            </option>
          ))}
        </select>
        <button type="submit" className={btnPrimary}>
          Search
        </button>
      </form>
      <p className="text-sm">
        {canUseNearMe ? (
          <Link href="/concerts?near=1" className={`inline-flex items-center gap-1.5 ${linkAccent}`}>
            <MapPin size={16} aria-hidden /> Show concerts near me
          </Link>
        ) : (
          <span className="text-muted">
            Want concerts near you?{" "}
            <Link href="/settings" className={linkAccent}>
              Share your location in Settings
            </Link>
            .
          </span>
        )}
      </p>

      {failed && <p className="text-red-600 dark:text-red-400">Couldn&apos;t load concerts right now. Try again in a minute.</p>}

      {heading && !failed && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight">
            {heading} <span className="font-normal text-muted">({results.length})</span>
          </h2>
          {results.length ? (
            <ul className="divide-y divide-line border-y border-line">
              {results.map(({ artist, show }) => (
                <li key={show.id}>
                  <Link
                    href={`/artists/${artist.id}#show-${show.id}`}
                    className="flex min-h-[64px] items-center gap-4 py-3 transition hover:opacity-80"
                  >
                    <div className="w-12 shrink-0 text-center" title={fmtDate(show.date)}>
                      {show.date ? (
                        <>
                          <div className="text-xs font-semibold uppercase text-muted">{datePart(show.date, { month: "short" })}</div>
                          <div className="text-2xl font-bold leading-tight">{datePart(show.date, { day: "numeric" })}</div>
                        </>
                      ) : (
                        <div className="text-xs font-semibold text-muted">TBA</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{artist.name}</div>
                      <div className="truncate text-sm text-muted">
                        {[show.venue, show.city].filter(Boolean).join(" · ")}
                      </div>
                    </div>
                    <ChevronRight size={20} aria-hidden className="shrink-0 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No concerts found. Check the spelling or try a nearby bigger city.</p>
          )}
        </section>
      )}
    </div>
  );
}
