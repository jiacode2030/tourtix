import Link from "next/link";

type Step = { done: boolean; label: string; href: string; action: string };

// First-run checklist; disappears once every step is done.
export function GetStarted({
  following,
  located,
  notifying,
}: {
  following: boolean;
  located: boolean;
  notifying: boolean;
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
  ];
  const remaining = steps.filter((s) => !s.done).length;
  if (remaining === 0) return null;

  return (
    <section className="space-y-3 rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/40">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="font-semibold">Get started</h2>
        <span className="text-sm text-zinc-500">
          {steps.length - remaining} of {steps.length} done
        </span>
      </div>
      <ol className="space-y-2">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-3 text-sm">
            <span
              aria-hidden="true"
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                s.done ? "bg-emerald-500 text-white" : "border-2 border-violet-300 dark:border-violet-700"
              }`}
            >
              {s.done ? "✓" : ""}
            </span>
            <span className={`flex-1 ${s.done ? "text-zinc-400 line-through" : ""}`}>
              <span className="sr-only">{s.done ? "Done: " : "To do: "}</span>
              {s.label}
            </span>
            {!s.done && (
              <Link href={s.href} className="font-medium text-violet-600 hover:underline">
                {s.action} →
              </Link>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
