import { Check } from "lucide-react";
import Link from "next/link";
import { linkAccent } from "@/lib/ui";

type Step = { done: boolean; label: string; href: string; action: string; optional?: boolean };

// First-run checklist; disappears once every step is done.
export function GetStarted({
  following,
  located,
  notifying,
  stamped = true,
}: {
  following: boolean;
  located: boolean;
  notifying: boolean;
  // Has added a concert to their passport. Optional: it never keeps this checklist on screen.
  stamped?: boolean;
}) {
  const steps: Step[] = [
    { done: following, label: "Follow an artist", href: "/", action: "Search artists" },
    { done: located, label: "Set your location for shows near you", href: "/settings", action: "Set location" },
    {
      done: notifying,
      label: "Turn on notifications so you never miss a ticket drop",
      href: "/settings#notifications",
      action: "Turn on",
    },
    { done: stamped, label: "Bonus: add a concert you've been to (private)", href: "/passport", action: "Open passport", optional: true },
  ];
  const required = steps.filter((s) => !s.optional);
  const remaining = required.filter((s) => !s.done).length;
  if (remaining === 0) return null;

  return (
    <section className="space-y-4 rounded-3xl bg-surface p-5 sm:p-6">
      <p className="text-sm text-muted">
        <strong>How TourTix works:</strong> we gather tour dates and on-sale times from ticket sites
        and send you alerts. <strong>We don&apos;t sell tickets</strong>: when you&apos;re ready to
        buy, we link you to the seller (like Ticketmaster), and you buy and pay on their site.
      </p>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold tracking-tight">Get started</h2>
        <span className="text-sm text-muted">
          {required.length - remaining} of {required.length} done
        </span>
      </div>
      <ol className="space-y-3">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-3 text-sm">
            <span
              aria-hidden="true"
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                s.done ? "bg-live text-bg" : "border-2 border-line"
              }`}
            >
              {s.done && <Check size={14} strokeWidth={3} />}
            </span>
            <span className={`flex-1 ${s.done ? "text-muted line-through" : ""}`}>
              <span className="sr-only">{s.done ? "Done: " : "To do: "}</span>
              {s.label}
            </span>
            {!s.done && (
              <Link href={s.href} className={`shrink-0 ${linkAccent}`}>
                {s.action}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
