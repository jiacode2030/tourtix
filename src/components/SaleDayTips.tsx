import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { SALE_DAY_TIPS } from "@/lib/sale-day";
import { linkAccent } from "@/lib/ui";

// Shown on the day of a sale, so people have the scam checklist at hand.
export function SaleDayTips() {
  return (
    <aside className="space-y-2 rounded-2xl bg-bg p-4 text-sm" aria-label="Sale day checklist">
      <p className="flex items-center gap-2 font-semibold">
        <ShieldCheck size={18} aria-hidden className="text-accent" /> Sale day checklist
      </p>
      <ul className="list-disc space-y-1 pl-5 text-muted marker:text-accent">
        {SALE_DAY_TIPS.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
      <Link href="/tips" className={linkAccent}>
        More ticket buying tips
      </Link>
    </aside>
  );
}
