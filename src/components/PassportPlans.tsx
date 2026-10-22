"use client";

import { Stamp as StampIcon, X } from "lucide-react";
import { addStamp } from "@/app/actions";
import { removePlan, splitPlans, type Plan } from "@/lib/plans";
import { stampDate } from "@/lib/passport";
import { btnPrimary, btnSecondary } from "@/lib/ui";
import { savePlans, usePlans } from "./plansStore";

const where = (p: Plan) => [p.venue, p.city].filter(Boolean).join(" · ");

// Shows you marked "I'm going", kept only in this browser. Once a show is over,
// one tap turns it into a stamp (or clears it). Nothing here is stored by TourTix.
export function PassportPlans() {
  const plans = usePlans();
  const { over, upcoming } = splitPlans(plans);
  if (plans.length === 0) return null;

  return (
    <section className="space-y-4 rounded-3xl bg-surface p-5 sm:p-6" aria-label="Shows you marked as going">
      {over.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xl font-bold tracking-tight">Did you go?</h2>
          <ul className="space-y-3">
            {over.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-bg p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.artistName}</p>
                  <p className="truncate text-sm text-muted">
                    {stampDate(p.date)}
                    {where(p) && ` · ${where(p)}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={addStamp} onSubmit={() => savePlans(removePlan(plans, p.id))}>
                    <input type="hidden" name="artistName" value={p.artistName} />
                    <input type="hidden" name="artistId" value={p.artistId ?? ""} />
                    <input type="hidden" name="date" value={p.date} />
                    <input type="hidden" name="city" value={p.city ?? ""} />
                    <input type="hidden" name="venue" value={p.venue ?? ""} />
                    <button type="submit" className={`${btnPrimary} min-h-10 px-4 text-sm`}>
                      <StampIcon size={16} aria-hidden /> Yes, stamp it
                    </button>
                  </form>
                  <button type="button" onClick={() => savePlans(removePlan(plans, p.id))} className={`${btnSecondary} min-h-10 px-4 text-sm`}>
                    No
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-bold tracking-tight">Shows you&apos;re going to</h2>
          <ul className="divide-y divide-line">
            {upcoming.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="min-w-0 truncate">
                  <span className="font-semibold">{p.artistName}</span>
                  <span className="text-muted">
                    {" "}
                    · {stampDate(p.date)}
                    {where(p) && ` · ${where(p)}`}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => savePlans(removePlan(plans, p.id))}
                  aria-label={`Remove ${p.artistName} from your plans`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted hover:text-fg"
                >
                  <X size={16} aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-muted">Saved only on this device. TourTix doesn&apos;t receive your plans, and clearing your browser data removes them.</p>
    </section>
  );
}
