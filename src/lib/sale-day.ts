// The sale-day checklist appears on the day a sale opens (and for an hour
// after it starts, while people are still in the queue).
const HOUR_MS = 60 * 60 * 1000;

export function isSaleDay(startIso: string, now = Date.now()): boolean {
  const t = Date.parse(startIso);
  if (!Number.isFinite(t)) return false;
  return t - now <= 24 * HOUR_MS && t - now > -HOUR_MS;
}

export const SALE_DAY_TIPS = [
  "Log in to the seller and save your payment details before the sale starts.",
  "Use one device and one tab. Don't keep refreshing once you're in the queue.",
  "Only use the seller link on TourTix or type the address yourself, and check it before you pay.",
  "Check the total with fees before you confirm, and pay by card. Never pay by gift card, Zelle, or wire.",
  "Anyone selling tickets before the sale starts is likely a scam.",
];
