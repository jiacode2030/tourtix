import type { SellerLink, Show } from "@/lib/types";
import { fmtDate, fmtDateTime } from "@/lib/format";
import { StatusBadge } from "./StatusBadge";

function saleNote(show: Show): string | null {
  const now = new Date();
  if (show.status === "announced") {
    const next = show.presales
      .filter((p) => p.start && new Date(p.start) > now)
      .sort((a, b) => a.start!.localeCompare(b.start!))[0];
    if (next?.start) return `${next.name} starts ${fmtDateTime(next.start, show.timezone)}`;
    if (show.publicSaleStart) return `On sale ${fmtDateTime(show.publicSaleStart, show.timezone)}`;
    return "On-sale date TBA";
  }
  if (show.status === "presale" && show.publicSaleStart) {
    return `General sale ${fmtDateTime(show.publicSaleStart, show.timezone)}`;
  }
  return null;
}

// Cheapest all-in price first; sellers without a known all-in price last.
function sortByPrice(links: SellerLink[]) {
  return [...links].sort(
    (a, b) => (a.allInPrice ?? Infinity) - (b.allInPrice ?? Infinity),
  );
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
    <ul className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {sorted.map((l, i) => {
        const price = fmtPrice(l);
        const cheapest = i === 0 && priced >= 2;
        return (
          <li key={l.seller} className="flex items-center gap-3 px-3 py-2">
            <span className="flex-1 text-sm font-medium">
              {l.seller}
              {cheapest && (
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
            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-violet-700"
            >
              View
            </a>
          </li>
        );
      })}
    </ul>
  );
}

export function ShowRow({
  show,
  homeRegion = null,
}: {
  show: Show;
  homeRegion?: string | null;
}) {
  const nearYou = homeRegion != null && show.country === "US" && show.region === homeRegion;
  const place = [show.city, show.region ?? show.country].filter(Boolean).join(", ");
  const note = saleNote(show);
  const buyable = show.status === "onsale" || show.status === "presale";

  return (
    <li className="space-y-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
          {note && <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{note}</div>}
        </div>
        <div className="self-start sm:self-auto">
          <StatusBadge status={show.status} />
        </div>
      </div>
      {buyable && show.links.length > 0 && <SellerOptions links={show.links} />}
    </li>
  );
}
