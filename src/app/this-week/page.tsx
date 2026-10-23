import type { Metadata } from "next";
import Link from "next/link";
import { AutoRefresh } from "@/components/AutoRefresh";
import { DropList } from "@/components/DropList";
import { LiveList } from "@/components/LiveList";
import { ShareButton } from "@/components/ShareButton";
import { liveSales, upcomingDrops } from "@/lib/data";
import { GENRES, isGenre } from "@/lib/genres";
import type { TicketDrop } from "@/lib/sales";
import { chip, chipOff, chipOn } from "@/lib/ui";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export const metadata: Metadata = {
  title: "Concert ticket drops this week",
  description:
    "Every concert presale and on-sale opening in the next 7 days, soonest first, plus presales open right now. Free, with links to the seller.",
  alternates: { canonical: "/this-week" },
};

// Drops starting within (or after) the given time from now.
function within(drops: TicketDrop[], ms: number, inside: boolean) {
  const now = Date.now();
  return drops.filter((d) => (Date.parse(d.sale.start) - now <= ms) === inside);
}

export default async function ThisWeek({ searchParams }: { searchParams: Promise<{ genre?: string }> }) {
  const { genre: raw } = await searchParams;
  const genre = isGenre(raw) ? raw : undefined;
  const [drops, live] = await Promise.all([upcomingDrops(WEEK_MS, 60, genre), liveSales(genre)]);
  const soon = within(drops, DAY_MS, true);
  const later = within(drops, DAY_MS, false);
  const genreLink = (g?: string) => (g ? `/this-week?genre=${encodeURIComponent(g)}` : "/this-week");

  return (
    <div className="space-y-10">
      <AutoRefresh />
      <header className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Ticket drops this week</h1>
        <p className="max-w-2xl text-muted">
          Concert presales and on-sales opening in the next 7 days for popular US tours, soonest first. Times are in
          each venue&apos;s local time. Tap an artist for every sale stage and the seller link.
        </p>
        <ShareButton title="Concert ticket drops this week" path="/this-week" />
      </header>

      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" aria-label="Filter by genre">
        {[undefined, ...GENRES].map((g) => (
          <Link key={g ?? "all"} href={genreLink(g)} scroll={false} className={`${chip} ${g === genre ? chipOn : chipOff}`}>
            {g ?? "All music"}
          </Link>
        ))}
      </nav>

      {soon.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight">In the next 24 hours</h2>
          <DropList drops={soon} />
        </section>
      )}

      {later.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight">Later this week</h2>
          <DropList drops={later} />
        </section>
      )}

      {drops.length === 0 && (
        <p className="rounded-3xl bg-surface p-6 text-center text-sm text-muted">
          No ticket sales are scheduled in the next 7 days{genre ? ` for ${genre}` : ""}. Check back soon, or{" "}
          <Link href="/" className="font-medium text-accent hover:underline">
            search for an artist
          </Link>
          .
        </p>
      )}

      {live.presales.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight">Presales open right now</h2>
          <p className="text-sm text-muted">Most need a code, sign-up, or membership. Each artist page says how to get in.</p>
          <LiveList items={live.presales} />
        </section>
      )}

      <p className="text-sm text-muted">
        This list covers the most in-demand US tours, so a smaller show may not appear. Follow an artist to be
        alerted about every one of their sales.
      </p>
    </div>
  );
}
