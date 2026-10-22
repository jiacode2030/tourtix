import type { Presale, TicketStatus } from "./types";

export function computeStatus(
  code: string | undefined,
  publicSaleStart: string | null,
  presales: Presale[],
  now = new Date(),
): TicketStatus {
  if (code === "cancelled" || code === "canceled") return "cancelled";
  if (code === "rescheduled") return "rescheduled";
  if (code === "postponed") return "postponed";

  // Ticketmaster also says "offsale" before the general sale starts (during
  // and between presales), so only trust it once every sale has started.
  const saleStillAhead =
    (publicSaleStart && new Date(publicSaleStart) > now) ||
    presales.some((p) => p.start && (new Date(p.start) > now || (p.end && new Date(p.end) > now)));
  if (code === "offsale" && !saleStillAhead) return "offsale";

  if (publicSaleStart && new Date(publicSaleStart) <= now) return code === "offsale" ? "offsale" : "onsale";

  const inPresale = presales.some(
    (p) =>
      p.start &&
      new Date(p.start) <= now &&
      (!p.end || new Date(p.end) > now),
  );
  if (inPresale) return "presale";

  if (!publicSaleStart && code === "onsale") return "onsale";
  return "announced";
}

export const statusLabel: Record<TicketStatus, string> = {
  announced: "Announced",
  presale: "Presale live",
  onsale: "On sale",
  offsale: "Off sale",
  cancelled: "Cancelled",
  rescheduled: "Rescheduled",
  postponed: "Postponed",
  listed: "Check availability",
};
