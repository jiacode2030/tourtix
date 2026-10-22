import { fmtDateTime } from "@/lib/format";
import type { LiveSale } from "@/lib/live";
import { presaleHelp } from "@/lib/presale-help";
import { btnPrimary } from "@/lib/ui";
import { PresaleBadge } from "./PresaleBadge";

// "Presale happening now" on an artist page.
export function LivePresales({ sales, memberships }: { sales: LiveSale[]; memberships?: readonly string[] }) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <span className="relative flex h-2.5 w-2.5" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-live" />
        </span>
        {sales.length === 1 ? "Presale happening now" : "Presales happening now"}
      </h2>
      <ul className="space-y-3">
        {sales.map((sale) => {
          const first = sale.shows[0];
          const seller = first.links[0];
          const signup = first.presales.find((p) => p.name === sale.label && p.url)?.url;
          return (
            <li key={sale.label} className="space-y-3 rounded-3xl bg-surface p-5">
              <div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-lg font-semibold">{sale.label}</p>
                  <PresaleBadge name={sale.label} memberships={memberships} />
                </div>
                <p className="text-sm text-muted">
                  {sale.shows.length} {sale.shows.length === 1 ? "show" : "shows"}
                  {sale.endsAt && <> · ends {fmtDateTime(sale.endsAt, first.timezone)}</>}
                </p>
              </div>
              <p className="text-sm">
                <span className="font-semibold">How to get in: </span>
                <span className="text-muted">{presaleHelp(sale.label)}</span>
              </p>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {seller && (
                  <a href={seller.url} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
                    Go to {seller.seller}
                  </a>
                )}
                {signup && (
                  <a href={signup} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-accent hover:underline">
                    Presale details
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-muted">General guidance only; rules differ by tour. Check the seller&apos;s presale details.</p>
    </section>
  );
}
