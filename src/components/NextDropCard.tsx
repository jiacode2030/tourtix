import type { NextDrop, SaleStage } from "@/lib/drops";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { presaleHelp } from "@/lib/presale-help";
import { btnPrimary } from "@/lib/ui";
import { AddToCalendar } from "./AddToCalendar";
import { Countdown } from "./Countdown";

function place(d: NextDrop["focus"]) {
  return [d.show.city, d.show.region ?? d.show.country].filter(Boolean).join(", ");
}

function StageChip({ stage, timeZone }: { stage: SaleStage; timeZone: string | null }) {
  const styles = {
    ended: "text-muted line-through",
    live: "bg-live-soft text-live",
    upcoming: "bg-bg text-fg",
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
    <li className={`rounded-full px-3 py-1.5 text-xs font-medium ${styles}`}>
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
    <section className="reveal space-y-4 rounded-3xl bg-surface p-5 sm:p-6">
      <div>
        <p className="text-sm font-medium text-muted">Next ticket drop · {drop.label}</p>
        <p className="mt-1 text-5xl font-bold tracking-tight">
          <Countdown to={focus.start} label={drop.label} bare />
        </p>
        <p className="mt-2 text-[15px] text-muted">
          Opens {drop.localTime} (venue&apos;s local time)
          <br />
          {count === 1 ? `For the ${place(focus)} show on ${fmtDate(focus.show.date)}` : `For ${count} shows`}
        </p>
        {differentZones && (
          <p className="mt-1 text-sm text-muted">
            Each city opens at its own local time.{" "}
            {focus.show.id === first.show.id ? (
              <>
                {place(first)} opens first ({fmtDateTime(first.start, first.show.timezone)}).
              </>
            ) : (
              <>
                Counting down to your nearest show, {place(focus)} (
                {fmtDateTime(focus.start, focus.show.timezone)}). {place(first)} opens first.
              </>
            )}
          </p>
        )}
      </div>

      {drop.label !== "General sale" && (
        <p className="rounded-2xl bg-bg p-4 text-sm">
          <span className="font-semibold">How to get in: </span>
          <span className="text-muted">{presaleHelp(drop.label)}</span>
        </p>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        {seller && (
          <a href={seller.url} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
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
          <a href={signup.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent hover:underline">
            Presale sign-up
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
    </section>
  );
}
