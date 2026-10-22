"use client";

import { CalendarPlus } from "lucide-react";

export type CalendarEvent = {
  title: string;
  start: string; // ISO, or YYYY-MM-DD when allDay
  end: string; // ISO, or the day after when allDay
  allDay?: boolean;
  location?: string;
  details?: string;
};

// 20261028T170000Z
const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

const day = (d: string) => d.replace(/-/g, "");

function googleUrl(e: CalendarEvent) {
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: e.title,
    dates: e.allDay ? `${day(e.start)}/${day(e.end)}` : `${stamp(e.start)}/${stamp(e.end)}`,
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
    `UID:${e.allDay ? day(e.start) : stamp(e.start)}-${Math.random().toString(36).slice(2)}@tourtix`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    e.allDay ? `DTSTART;VALUE=DATE:${day(e.start)}` : `DTSTART:${stamp(e.start)}`,
    e.allDay ? `DTEND;VALUE=DATE:${day(e.end)}` : `DTEND:${stamp(e.end)}`,
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
      <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-sm font-medium text-accent hover:underline">
        <CalendarPlus size={18} aria-hidden /> {label}
      </summary>
      <div className="absolute left-0 z-20 mt-1 w-56 overflow-hidden rounded-xl border border-line bg-bg text-sm shadow-xl">
        <a
          href={googleUrl(event)}
          target="_blank"
          rel="noopener noreferrer"
          className="block px-4 py-3 hover:bg-surface"
        >
          Google Calendar
        </a>
        <button
          type="button"
          onClick={() => downloadIcs(event)}
          className="block w-full px-4 py-3 text-left hover:bg-surface"
        >
          Apple / Outlook (.ics)
        </button>
      </div>
    </details>
  );
}
