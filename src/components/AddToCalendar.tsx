"use client";

export type CalendarEvent = {
  title: string;
  start: string; // ISO
  end: string; // ISO
  location?: string;
  details?: string;
};

// 20261028T170000Z
const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

function googleUrl(e: CalendarEvent) {
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: `${stamp(e.start)}/${stamp(e.end)}`,
    details: e.details ?? "",
    location: e.location ?? "",
  });
  return `https://calendar.google.com/calendar/render?${q}`;
}

const escapeIcs = (s: string) => s.replace(/[\;,]/g, (c) => `\\${c}`).replace(/\n/g, "\\n");

function downloadIcs(e: CalendarEvent) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//TourTix//EN",
    "BEGIN:VEVENT",
    `UID:${stamp(e.start)}-${Math.random().toString(36).slice(2)}@tourtix`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(e.start)}`,
    `DTEND:${stamp(e.end)}`,
    `SUMMARY:${escapeIcs(e.title)}`,
    e.location ? `LOCATION:${escapeIcs(e.location)}` : "",
    e.details ? `DESCRIPTION:${escapeIcs(e.details)}` : "",
    // Reminder 30 minutes before.
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs(e.title)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "tourtix.ics";
  a.click();
  URL.revokeObjectURL(a.href);
}

export function AddToCalendar({ event, label }: { event: CalendarEvent; label: string }) {
  return (
    <details className="relative">
      <summary className="cursor-pointer list-none text-sm font-medium text-violet-600 hover:underline">
        📅 {label}
      </summary>
      <div className="absolute left-0 z-10 mt-2 w-52 overflow-hidden rounded-lg border border-zinc-200 bg-white text-sm shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
        <a
          href={googleUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          Google Calendar
        </a>
        <button
          type="button"
          onClick={() => downloadIcs(event)}
          className="block w-full px-4 py-2 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800"
        >
          Apple / Outlook (.ics)
        </button>
      </div>
    </details>
  );
}
