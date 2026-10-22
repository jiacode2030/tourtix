import { fmtDate, fmtDateTime, zonedTimeToUtc } from "@/lib/format";
import { upcomingSaleStarts } from "@/lib/sales";
import { otherSiteSearches, type SearchLink } from "@/lib/search-links";
import type { SellerLink, Show } from "@/lib/types";
import { AddToCalendar, type CalendarEvent } from "./AddToCalendar";
import { Countdown } from "./Countdown";
import { ShareButton } from "./ShareButton";
import { StatusBadge } from "./StatusBadge";

const FOREVER = Number.MAX_SAFE_INTEGER;

function placeOf(show: Show) {
  return [show.city, show.region ?? show.country].filter(Boolean).join(", ");
}

// Cheapest all-in price first; sellers without a known all-in price last.
function sortByPrice(links: SellerLink[]) {
  return [...links].sort((a, b) => (a.allInPrice ?? Infinity) - (b.allInPrice ?? Infinity));
}

function fmtPrice(l: SellerLink) {
  if (l.allInPrice == null) return null;
  const amount = `$${Math.round(l.allInPrice)}`;
  return l.currency && l.currency !== "USD" ? `${amount} ${l.currency}` : amount;
}

const sellerButton =
  "rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700";

function SellerOptions({ links }: { links: SellerLink[] }) {
  const sorted = sortByPrice(links);
  const priced = sorted.filter((l) => l.allInPrice != null).length;

  // No prices from any seller: one clear button per seller.
  if (priced === 0) {
    return (
      <div className="grid gap-2 sm:grid-cols-2">
        {sorted.map((l) => (
          <a
            key={l.seller}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-violet-600 px-4 py-3 text-center font-semibold text-white hover:bg-violet-700"
          >
            Get tickets on {l.seller} →
          </a>
        ))}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {sorted.map((l, i) => {
        const price = fmtPrice(l);
        return (
          <li key={l.seller} className="flex items-center gap-3 px-3 py-2">
            <span className="flex-1 text-sm font-medium">
              {l.seller}
              {i === 0 && priced >= 2 && (
                <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  Cheapest
                </span>
              )}
            </span>
            <span className="text-right text-sm">
              {price ? (
                <>
                  <span className="font-semibold">from {price}</span>
                  <span className="block text-xs text-zinc-600 dark:text-zinc-400">incl. fees</span>
                </>
              ) : (
                <span className="text-zinc-600 dark:text-zinc-400">See price on site</span>
              )}
            </span>
            <a href={l.url} target="_blank" rel="noopener noreferrer" className={sellerButton}>
              View
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function SiteLinks({ label, links }: { label: string; links: SearchLink[] }) {
  if (!links.length) return null;
  return (
    <div>
      <span className="text-zinc-600 dark:text-zinc-400">{label}: </span>
      {links.map((l, i) => (
        <span key={l.name}>
          {i > 0 && " · "}
          <a
            href={l.url}
            target="_blank"
            rel="nofollow noopener noreferrer"
            title={`Search ${l.name}`}
            className="font-medium text-violet-600 hover:underline"
          >
            {l.name}
          </a>
        </span>
      ))}
    </div>
  );
}

function OtherSites({ artistName, show }: { artistName: string; show: Show }) {
  const { resale, official } = otherSiteSearches(artistName, show.city, show.links.map((l) => l.seller));
  if (!resale.length && !official.length) return null;
  return (
    <div className="space-y-1.5">
      <h4 className="font-semibold">Search other ticket sites</h4>
      <SiteLinks label="Resale" links={resale} />
      <SiteLinks label="Other official sellers" links={official} />
      <p className="text-xs text-zinc-600 dark:text-zinc-400">
        Opens each site&apos;s own search. Not checked by TourTix, so they may not have this show.
      </p>
    </div>
  );
}

function showEvent(show: Show, artistName: string): CalendarEvent | null {
  if (!show.date) return null;
  const common = {
    title: `${artistName} concert`,
    location: [show.venue, placeOf(show)].filter(Boolean).join(", "),
    details: show.links.map((l) => `${l.seller}: ${l.url}`).join("\n"),
  };
  // Without a start time and time zone, an all-day event is the honest choice.
  if (!show.time || !show.timezone) {
    const next = new Date(`${show.date}T12:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    return { ...common, allDay: true, start: show.date, end: next.toISOString().slice(0, 10) };
  }
  const start = zonedTimeToUtc(show.date, show.time, show.timezone);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  return { ...common, start: start.toISOString(), end: end.toISOString() };
}

function Details({ show }: { show: Show }) {
  const { extras } = show;
  const presales = show.presales.filter((p) => p.start || p.url || p.description);
  const facts: [string, string | undefined][] = [
    ["Ticket limit", extras.ticketLimit],
    ["Age", extras.ageRestriction],
    ["Accessibility", extras.accessibility],
    ["Please note", extras.pleaseNote],
    ["Parking", extras.parking],
  ];
  const hasFacts = facts.some(([, v]) => v);
  if (!presales.length && !extras.seatmapUrl && !hasFacts) return null;

  return (
      <div className="space-y-4">
        {presales.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Presales</h4>
            <ul className="space-y-2">
              {presales.map((p, i) => (
                <li key={i} className="rounded-md bg-white p-2 dark:bg-zinc-900">
                  <div className="font-medium">{p.name}</div>
                  {p.start && (
                    <div className="text-zinc-600 dark:text-zinc-400">
                      {fmtDateTime(p.start, show.timezone)}
                      {p.end && ` – ${fmtDateTime(p.end, show.timezone)}`}
                    </div>
                  )}
                  {p.description && <p className="mt-1 text-zinc-600 dark:text-zinc-400">{p.description}</p>}
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-block font-medium text-violet-600 hover:underline"
                    >
                      Sign up / presale details →
                    </a>
                  )}
                </li>
              ))}
            </ul>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Some presales (like Verified Fan) need you to register days ahead. Check the sign-up
              link early.
            </p>
          </div>
        )}
        {extras.seatmapUrl && (
          <div className="space-y-2">
            <h4 className="font-semibold">Seat map</h4>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={extras.seatmapUrl}
              alt={`Seat map for ${show.venue ?? "the venue"}`}
              loading="lazy"
              className="max-h-96 w-full rounded-md bg-white object-contain"
            />
          </div>
        )}
        {hasFacts && (
          <dl className="space-y-2">
            {facts
              .filter(([, v]) => v)
              .map(([k, v]) => (
                <div key={k}>
                  <dt className="font-semibold">{k}</dt>
                  <dd className="whitespace-pre-line text-zinc-600 dark:text-zinc-400">{v}</dd>
                </div>
              ))}
          </dl>
        )}
      </div>
  );
}

export function ShowRow({
  show,
  artistId,
  artistName,
  nearYou = false,
  coveredByDrop = false,
}: {
  show: Show;
  artistId: string;
  artistName: string;
  nearYou?: boolean;
  // The page's "Next ticket drop" card already shows this show's next sale.
  coveredByDrop?: boolean;
}) {
  const place = placeOf(show);
  const nextSale = upcomingSaleStarts(show, FOREVER)[0];
  const showSale = nextSale && !coveredByDrop;
  const canBuy = show.status !== "cancelled" && show.status !== "offsale" && show.status !== "postponed";
  const concert = showEvent(show, artistName);
  const hasMore =
    canBuy ||
    show.presales.some((p) => p.start || p.url || p.description) ||
    Object.values(show.extras).some(Boolean);

  return (
    <li
      id={`show-${show.id}`}
      className="scroll-mt-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex gap-4 p-4">
        <DateTile date={show.date} />
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-lg font-semibold leading-snug">{place || "Location TBA"}</p>
              {show.venue && <p className="truncate text-sm text-zinc-600 dark:text-zinc-400">{show.venue}</p>}
            </div>
            <StatusBadge status={show.status} />
          </div>
          {nearYou && (
            <span className="inline-block rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-950 dark:text-violet-300">
              📍 Near you
            </span>
          )}
          {nextSale && coveredByDrop && (
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              {nextSale.label}: {fmtDateTime(nextSale.start, show.timezone)}
            </p>
          )}
          {showSale && (
            <div className="text-sm">
              <p className="text-zinc-700 dark:text-zinc-300">
                {nextSale.label}: {fmtDateTime(nextSale.start, show.timezone)}
              </p>
              <Countdown to={nextSale.start} label={nextSale.label} />
            </div>
          )}
        </div>
      </div>

      {canBuy && show.links.length > 0 && (
        <div className="px-4 pb-4">
          <SellerOptions links={show.links} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-zinc-100 px-4 py-3 text-sm dark:border-zinc-800">
        {showSale ? (
          <AddToCalendar
            label="Remind me"
            event={{
              title: `${artistName} – ${nextSale.label}`,
              start: nextSale.start,
              end: new Date(new Date(nextSale.start).getTime() + 30 * 60 * 1000).toISOString(),
              location: show.links[0]?.url,
              details: `${artistName} at ${show.venue ?? place}, ${fmtDate(show.date)}.\n${show.links
                .map((l) => `${l.seller}: ${l.url}`)
                .join("\n")}`,
            }}
          />
        ) : (
          canBuy && concert && <AddToCalendar label="Add to calendar" event={concert} />
        )}
        <ShareButton
          title={`${artistName} – ${place}, ${fmtDate(show.date)}`}
          path={`/artists/${artistId}#show-${show.id}`}
        />
        {hasMore && (
        <details className="group w-full">
          <summary className="cursor-pointer list-none font-medium text-violet-600 hover:underline">
            <span className="group-open:hidden">More ▾</span>
            <span className="hidden group-open:inline">Less ▴</span>
          </summary>
          <div className="mt-3 space-y-4 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/50">
            {canBuy && <OtherSites artistName={artistName} show={show} />}
            <Details show={show} />
            {showSale && canBuy && concert && <AddToCalendar label="Add the concert itself to your calendar" event={concert} />}
          </div>
        </details>
        )}
      </div>
    </li>
  );
}

// Calendar-style date block: "NOV / 21 / Sat".
function DateTile({ date }: { date: string | null }) {
  if (!date) {
    return (
      <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-violet-50 py-2 text-xs font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
        TBA
      </div>
    );
  }
  const d = new Date(`${date}T12:00:00Z`);
  const part = (opts: Intl.DateTimeFormatOptions) => d.toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
  return (
    <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-violet-50 py-2 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
      <span className="text-xs font-semibold uppercase">{part({ month: "short" })}</span>
      <span className="text-2xl font-bold leading-none">{part({ day: "numeric" })}</span>
      <span className="text-xs">{part({ weekday: "short" })}</span>
      {d.getUTCFullYear() !== new Date().getUTCFullYear() && <span className="text-[10px] opacity-75">{d.getUTCFullYear()}</span>}
    </div>
  );
}
