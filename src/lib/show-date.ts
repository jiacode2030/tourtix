// Ticketmaster can keep listing a show for a while after its night has ended.
// A show is over once its local date is before today's date at the venue.
export function isOver(date: string | null, timeZone: string | null, now = Date.now()): boolean {
  if (!date) return false;
  let today: string;
  try {
    today = new Date(now).toLocaleDateString("en-CA", { timeZone: timeZone ?? "UTC" });
  } catch {
    today = new Date(now).toISOString().slice(0, 10);
  }
  return date < today;
}
