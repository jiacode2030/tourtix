import type { NextDrop, SaleStage } from "@/lib/drops";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { presaleHelp } from "@/lib/presale-help";
import { AddToCalendar } from "./AddToCalendar";
import { Countdown } from "./Countdown";

function place(d: NextDrop["focus"]) {
  return [d.show.city, d.show.region ?? d.show.country].filter(Boolean).join(", ");
}

function StageChip({ stage, timeZone }: { stage: SaleStage; timeZone: string | null }) {
  const styles = {
    ended: "bg-zinc-100 text-zinc-500 line-through dark:bg-zinc-800",
    live: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
    upcoming: "bg-white text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
  }[stage.state];
  const detail =
    stage.state === "live"
      ? stage.label === "General sale"
        ? "on sale now"
        : "live now"
      : stage.state === "ended"
        ? "ended"
        : stage.start
          ? fmtDateTime(stage.start, timeZone)
          : "";
  return (
    <li className={`rounded-full px-3 py-1 text-xs font-medium ${styles}`}>
      {stage.label}
      {detail && <span className="font-normal"> · {detail}</span>}
    </li>
  );
}

// The headline card on an artist page: the next ticket drop with a big
// countdown, which shows it covers, and every sale stage on the tour.
export function NextDropCard({
  artistName,
  drop,
  timeline,
}: {
  artistName: string;
  drop: NextDrop;
  timeline: SaleStage[];
}) {
  const { focus, shows } = drop;
  const first = shows[0];
  const count = shows.length;
  const differentZones = new Set(shows.map((d) => d.start)).size > 1;
  const seller = focus.show.links[0];
  const signup = focus.show.presales.find((p) => p.name === drop.label && p.url);

  return (
    <section className="space-y-4 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-5 dark:border-violet-900 dark:from-violet-950/50 dark:to-fuchsia-950/30">
      <div className="space-y-1">
        <p className="text-sm font-medium text-violet-700 dark:text-violet-300">🎟️ Next ticket drop</p>
        <h2 className="text-xl font-bold">{drop.label}</h2>
        <p className="text-4xl font-extrabold tracking-tight text-violet-700 sm:text-5xl dark:text-violet-300">
          <Countdown to={focus.start} label={drop.label} bare />
        </p>
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          {drop.localTime} local time · {count === 1 ? `${place(focus)}, ${fmtDate(focus.show.date)}` : `${count} shows`}
        </p>
        {differentZones && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Each city opens at its own local time.{" "}
            {focus.show.id === first.show.id ? (
              <>
                Opens first in {place(first)} ({fmtDateTime(first.start, first.show.timezone)}).
              </>
            ) : (
              <>
                The countdown is for your nearest show, {place(focus)} (
                {fmtDateTime(focus.start, focus.show.timezone)}). {place(first)} opens first.
              </>
            )}
          </p>
        )}
      </div>

      {drop.label !== "General sale" && (
        <p className="rounded-lg bg-white/70 p-3 text-sm dark:bg-zinc-900/60">
          <span className="font-medium">How to get in:</span> {presaleHelp(drop.label)}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {seller && (
          <a
            href={seller.url}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            Go to {seller.seller}
          </a>
        )}
        <AddToCalendar
          label="Remind me"
          event={{
            title: `${artistName} – ${drop.label}`,
            start: focus.start,
            end: new Date(new Date(focus.start).getTime() + 30 * 60 * 1000).toISOString(),
            location: seller?.url,
            details: `${artistName} ${drop.label.toLowerCase()} for ${place(focus)}, ${fmtDate(focus.show.date)}.${
              seller ? `\n${seller.seller}: ${seller.url}` : ""
            }`,
          }}
        />
        {signup?.url && (
          <a
            href={signup.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-violet-600 hover:underline"
          >
            Presale sign-up / details →
          </a>
        )}
      </div>

      {timeline.length > 1 && (
        <ul className="flex flex-wrap gap-2" aria-label="Ticket sales for these shows">
          {timeline.map((s) => (
            <StageChip key={s.label} stage={s} timeZone={focus.show.timezone} />
          ))}
        </ul>
      )}
      <p className="text-xs text-zinc-500">
        You buy on the seller&apos;s site. Times come from Ticketmaster and can change.
      </p>
    </section>
  );
}
