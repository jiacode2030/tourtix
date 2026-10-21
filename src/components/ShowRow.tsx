import { fmtDate, fmtDateTime, zonedTimeToUtc } from "@/lib/format";
import { upcomingSaleStarts } from "@/lib/sales";
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

  // No prices from any seller: just offer a button per seller.
  if (priced === 0) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-zinc-500">Check prices on:</span>
        {sorted.map((l) => (
          <a key={l.seller} href={l.url} target="_blank" rel="noopener noreferrer" className={sellerButton}>
            {l.seller}
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
                  <span className="block text-xs text-zinc-500">incl. fees</span>
                </>
              ) : (
                <span className="text-zinc-500">See price on site</span>
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

function showEvent(show: Show, artistName: string): CalendarEvent | null {
  if (!show.date) return null;
  const start =
    show.time && show.timezone
      ? zonedTimeToUtc(show.date, show.time, show.timezone)
      : new Date(`${show.date}T20:00:00Z`);
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
  return {
    title: `${artistName} concert`,
    start: start.toISOString(),
    end: end.toISOString(),
    location: [show.venue, placeOf(show)].filter(Boolean).join(", "),
    details: show.links.map((l) => `${l.seller}: ${l.url}`).join("\n"),
  };
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
    <details className="group rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
      <summary className="cursor-pointer px-3 py-2 text-sm font-medium">
        Presales, seat map &amp; info
      </summary>
      <div className="space-y-4 px-3 pb-3 text-sm">
        {presales.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-semibold">Presales</h4>
            <ul className="space-y-2">
              {presales.map((p, i) => (
                <li key={i} className="rounded-md bg-white p-2 dark:bg-zinc-900">
                  <div className="font-medium">{p.name}</div>
                  {p.start && (
                    <div className="text-zinc-500">
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
            <p className="text-xs text-zinc-500">
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
    </details>
  );
}

export function ShowRow({
  show,
  artistId,
  artistName,
  nearYou = false,
}: {
  show: Show;
  artistId: string;
  artistName: string;
  nearYou?: boolean;
}) {
  const place = placeOf(show);
  const nextSale = upcomingSaleStarts(show, FOREVER)[0];
  const canBuy = show.status !== "cancelled" && show.status !== "offsale";
  const concert = showEvent(show, artistName);

  return (
    <li id={`show-${show.id}`} className="scroll-mt-6 space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="w-32 shrink-0 text-sm font-semibold text-violet-600">{fmtDate(show.date)}</div>
        <div className="min-w-0 flex-1">
          <div className="font-medium">
            {place || "Location TBA"}
            {nearYou && (
              <span className="ml-2 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800 dark:bg-violet-950 dark:text-violet-300">
                Near you
              </span>
            )}
          </div>
          <div className="truncate text-sm text-zinc-500">{show.venue}</div>
          {nextSale && (
            <div className="mt-1 space-y-0.5 text-sm">
              <div className="text-zinc-600 dark:text-zinc-400">
                {nextSale.label} starts {fmtDateTime(nextSale.start, show.timezone)}
              </div>
              <Countdown to={nextSale.start} label={nextSale.label} />
            </div>
          )}
        </div>
        <div className="self-start">
          <StatusBadge status={show.status} />
        </div>
      </div>

      {canBuy && show.links.length > 0 && <SellerOptions links={show.links} />}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {nextSale && (
          <AddToCalendar
            label={`Remind me: ${nextSale.label.toLowerCase()}`}
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
        )}
        {canBuy && concert && <AddToCalendar label="Add concert to calendar" event={concert} />}
        <ShareButton
          title={`${artistName} – ${place}, ${fmtDate(show.date)}`}
          path={`/artists/${artistId}#show-${show.id}`}
        />
      </div>

      <Details show={show} />
    </li>
  );
}
