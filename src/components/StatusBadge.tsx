import { statusLabel } from "@/lib/status";
import type { TicketStatus } from "@/lib/types";

const styles: Record<TicketStatus, string> = {
  announced: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300",
  presale: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  onsale: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  offsale: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
  listed: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  rescheduled: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {statusLabel[status]}
    </span>
  );
}
