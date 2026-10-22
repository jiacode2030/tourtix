import { fmtDateTime } from "@/lib/format";
import type { LiveSale } from "@/lib/live";

// "Presale happening now" on an artist page.
export function LivePresales({ sales }: { sales: LiveSale[] }) {
  return (
    <section className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900 dark:bg-emerald-950/40">
      <h2 className="text-lg font-bold">🔥 {sales.length === 1 ? "Presale" : "Presales"} happening now</h2>
      <ul className="space-y-3">
        {sales.map((sale) => {
          const first = sale.shows[0];
          const seller = first.links[0];
          const signup = first.presales.find((p) => p.name === sale.label && p.url)?.url;
          return (
            <li key={sale.label} className="space-y-2 rounded-xl bg-white p-3 dark:bg-zinc-900">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-semibold">{sale.label}</span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {sale.shows.length} {sale.shows.length === 1 ? "show" : "shows"}
                  {sale.endsAt && <> · ends {fmtDateTime(sale.endsAt, first.timezone)}</>}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                {seller && (
                  <a
                    href={seller.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-violet-600 px-3 py-1.5 font-medium text-white hover:bg-violet-700"
                  >
                    Go to {seller.seller}
                  </a>
                )}
                {signup && (
                  <a href={signup} target="_blank" rel="noopener noreferrer" className="font-medium text-violet-600 hover:underline">
                    Presale details →
                  </a>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <p className="text-xs text-zinc-500">
        Presales usually need a code, a sign-up, or a membership. Check the seller&apos;s presale details.
      </p>
    </section>
  );
}
