import { ChevronDown, MapPin, Ticket } from "lucide-react";
import Link from "next/link";
import { fmtDate, fmtDateTime, zonedTimeToUtc } from "@/lib/format";
import { earliestForYou } from "@/lib/presale-access";
import { upcomingSaleStarts } from "@/lib/sales";
import { otherSiteSearches, type SearchLink } from "@/lib/search-links";
import type { SellerLink, Show } from "@/lib/types";
import { btnPrimary } from "@/lib/ui";
import { AddToCalendar, type CalendarEvent } from "./AddToCalendar";
import { Countdown } from "./Countdown";
import { PresaleBadge } from "./PresaleBadge";
import { ShareButton } from "./ShareButton";
import { statusLabel } from "@/lib/status";

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

function SellerOptions({ links }: { links: SellerLink[] }) {
  const sorted = sortByPrice(links);
  const priced = sorted.filter((l) => l.allInPrice != null).length;
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {sorted.map((l, i) => {
        const price = fmtPrice(l);
        const note = [price && `from ${price} incl. fees`, i === 0 && priced >= 2 && "cheapest"].filter(Boolean).join(" · ");
        return (
          <a key={l.seller} href={l.url} target="_blank" rel="noopener noreferrer" className={`${btnPrimary} w-full py-2`}>
            <span className="flex flex-col items-center leading-tight">
              <span>Get tickets on {l.seller}</span>
              {note && <span className="text-xs font-normal opacity-80">{note}</span>}
            </span>
          </a>
        );
      })}
    </div>
  );
}

function SiteLinks({ label, links }: { label: string; links: SearchLink[] }) {
  if (!links.length) return null;
  return (
    <p>
      <span className="text-muted">{label}: </span>
      {links.map((l, i) => (
        <span key={l.name}>
          {i > 0 && " · "}
          <a href={l.url} target="_blank" rel="nofollow noopener noreferrer" className="font-medium text-accent hover:underline">
            {l.name}
          </a>
        </span>
      ))}
    </p>
  );
}

function OtherSites({ artistName, show }: { artistName: string; show: Show }) {
  const { resale, official } = otherSiteSearches(artistName, show.city, show.links.map((l) => l.seller));
  if (!resale.length && !official.length) return null;
  return (
    <div className="space-y-1">
      <h4 className="font-semibold">Search other ticket sites</h4>
      <SiteLinks label="Resale" links={resale} />
      <SiteLinks label="Other official sellers" links={official} />
      <p className="text-xs text-muted">
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

function Details({ show, memberships }: { show: Show; memberships?: readonly string[] }) {
  const { extras } = show;
  const presales = show.presales
    .filter((p) => p.start || p.url || p.description)
    .sort((a, b) => (a.start ?? "~").localeCompare(b.start ?? "~"));
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
          <ul className="divide-y divide-line">
            {presales.map((p, i) => (
              <li key={i} className="py-2">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium">{p.name}</span>
                  <PresaleBadge name={p.name} memberships={memberships} />
                </div>
                {p.start && (
                  <div className="text-muted">
                    {fmtDateTime(p.start, show.timezone)}
                    {p.end && ` – ${fmtDateTime(p.end, show.timezone)}`}
                  </div>
                )}
                {p.description && <p className="mt-1 text-muted">{p.description}</p>}
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block font-medium text-accent hover:underline">
                    Sign up / presale details
                  </a>
                )}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted">
            Some presales (like Verified Fan) need you to register days ahead.
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
            className="max-h-96 w-full rounded-xl bg-white object-contain"
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
                <dd className="whitespace-pre-line text-muted">{v}</dd>
              </div>
            ))}
        </dl>
      )}
    </div>
  );
}

const statusTone: Record<string, string> = {
  onsale: "text-live",
  presale: "text-live",
  announced: "text-accent",
  listed: "text-muted",
  offsale: "text-muted",
  cancelled: "text-red-600 dark:text-red-400",
  postponed: "text-amber-700 dark:text-amber-400",
  rescheduled: "text-amber-700 dark:text-amber-400",
};

// One show as a clean row: date, city, venue, and status. Tapping it opens
// the ticket buttons, reminders, other ticket sites, and venue details.
export function ShowRow({
  show,
  artistId,
  artistName,
  nearYou = false,
  coveredByDrop = false,
  memberships,
  listingName,
}: {
  show: Show;
  artistId: string;
  artistName: string;
  nearYou?: boolean;
  // The page's "Next ticket drop" card already counts down to this show's sale.
  coveredByDrop?: boolean;
  // Accounts and cards ticked in Settings; undefined when signed out.
  memberships?: readonly string[];
  // Shown when several listings share this date and venue (passes, packages).
  listingName?: string;
}) {
  const place = placeOf(show);
  const nextSale = upcomingSaleStarts(show, FOREVER)[0];
  const canBuy = show.status !== "cancelled" && show.status !== "offsale" && show.status !== "postponed";
  const concert = showEvent(show, artistName);
  const yours = memberships ? earliestForYou(show, memberships) : null;
  const hasPresales = show.presales.length > 0 && canBuy;
  const d = show.date ? new Date(`${show.date}T12:00:00Z`) : null;
  const part = (opts: Intl.DateTimeFormatOptions) => d!.toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });

  return (
    <li id={`show-${show.id}`} className="scroll-mt-20">
      <details className="group smooth">
        <summary className="flex min-h-[72px] cursor-pointer list-none items-center gap-4 py-3 transition active:bg-surface">
          <div className="w-12 shrink-0 text-center">
            {d ? (
              <>
                <div className="text-xs font-semibold uppercase text-muted">{part({ month: "short" })}</div>
                <div className="text-2xl font-bold leading-tight">{part({ day: "numeric" })}</div>
              </>
            ) : (
              <div className="text-xs font-semibold text-muted">TBA</div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold">{place || "Location TBA"}</p>
            <p className="truncate text-sm text-muted">
              {show.venue}
              {show.venue && " · "}
              <span className={`font-medium ${statusTone[show.status] ?? "text-muted"}`}>
                {nextSale && !coveredByDrop && show.status !== "presale" ? (
                  <Countdown to={nextSale.start} label={nextSale.label} />
                ) : (
                  statusLabel[show.status]
                )}
              </span>
            </p>
            {listingName && <p className="mt-0.5 truncate text-xs text-muted">{listingName}</p>}
            {yours && (
              <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-live">
                <Ticket size={12} aria-hidden /> Your presale: {yours.name}
              </p>
            )}
            {nearYou && (
              <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-accent">
                <MapPin size={12} aria-hidden /> Near you
              </p>
            )}
          </div>
          <ChevronDown size={20} aria-hidden className="shrink-0 text-muted transition group-open:rotate-180" />
        </summary>

        <div className="reveal-panel space-y-4 pb-5 pl-16 text-sm">
          <p className="text-muted">
            {d && part({ weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            {nextSale && (
              <>
                <br />
                {nextSale.label}: {fmtDateTime(nextSale.start, show.timezone)}
              </>
            )}
          </p>
          {yours && (
            <p className="rounded-2xl bg-live-soft px-4 py-3 text-fg">
              <span className="font-semibold">Your earliest presale:</span> {yours.name},{" "}
              {fmtDateTime(yours.start, show.timezone)}
            </p>
          )}
          {!yours && memberships?.length === 0 && hasPresales && (
            <p className="text-muted">
              <Link href="/settings#presales" className="font-medium text-accent hover:underline">
                Tell us which presales you can get into
              </Link>{" "}
              to see the earliest one for you.
            </p>
          )}
          {canBuy && show.links.length > 0 && <SellerOptions links={show.links} />}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {nextSale ? (
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
            {nextSale && canBuy && concert && <AddToCalendar label="Add concert to calendar" event={concert} />}
            <ShareButton title={`${artistName} – ${place}, ${fmtDate(show.date)}`} path={`/artists/${artistId}#show-${show.id}`} />
          </div>
          {canBuy && <OtherSites artistName={artistName} show={show} />}
          <Details show={show} memberships={memberships} />
        </div>
      </details>
    </li>
  );
}
