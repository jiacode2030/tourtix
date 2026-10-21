// Replays Calvin Harris's real 2027 tour sale schedule (Chicago show, venue
// time zone America/Chicago) and checks what TourTix would show at each moment.
import { describe, expect, it } from "vitest";
import { fmtDateTime } from "./format";
import { upcomingSaleStarts } from "./sales";
import { computeStatus } from "./status";
import { makeShow } from "./test-helpers";

// Noon in Chicago during daylight time is 17:00 UTC.
const presales = [
  { name: "Reserved by Spotify Presale", start: "2026-10-19T15:00:00Z", end: "2026-10-22T15:00:00Z", url: null, description: null },
  { name: "Artist Presale", start: "2026-10-20T17:00:00Z", end: "2026-10-22T15:00:00Z", url: null, description: null },
  { name: "Live Nation Presale", start: "2026-10-21T17:00:00Z", end: "2026-10-22T15:00:00Z", url: null, description: null },
];
const publicSaleStart = "2026-10-22T17:00:00Z";
const show = makeShow({ timezone: "America/Chicago", city: "Chicago", region: "IL", presales, publicSaleStart });
const FOREVER = Number.MAX_SAFE_INTEGER;

function at(iso: string) {
  const now = new Date(iso);
  return {
    status: computeStatus("onsale", publicSaleStart, presales, now),
    next: upcomingSaleStarts(show, FOREVER, now.getTime())[0] ?? null,
    msLeft: (start: string) => new Date(start).getTime() - now.getTime(),
  };
}

describe("Calvin Harris sale schedule", () => {
  it("Wed morning before the Live Nation presale: presale live, counting down to Live Nation", () => {
    const t = at("2026-10-21T14:00:00Z"); // 9 AM Chicago
    expect(t.status).toBe("presale"); // Spotify and Artist presales are open
    expect(t.next?.label).toBe("Live Nation Presale");
    expect(t.msLeft(t.next!.start)).toBe(3 * 60 * 60 * 1000); // 3 hours
    expect(fmtDateTime(t.next!.start, show.timezone)).toBe("Oct 21, 12:00 PM CDT");
  });

  it("Wed afternoon: counting down to the general sale tomorrow at noon", () => {
    const t = at("2026-10-21T19:00:00Z"); // 2 PM Chicago
    expect(t.status).toBe("presale");
    expect(t.next?.label).toBe("General sale");
    expect(t.msLeft(t.next!.start)).toBe(22 * 60 * 60 * 1000); // 22 hours
    expect(fmtDateTime(t.next!.start, show.timezone)).toBe("Oct 22, 12:00 PM CDT");
  });

  it("Thu between presales ending and the general sale: announced, counting down", () => {
    const t = at("2026-10-22T16:00:00Z"); // 11 AM Chicago, presales ended at 10 AM
    expect(t.status).toBe("announced");
    expect(t.next?.label).toBe("General sale");
    expect(t.msLeft(t.next!.start)).toBe(60 * 60 * 1000); // 1 hour
  });

  it("Thu after noon: on sale, no countdown", () => {
    const t = at("2026-10-22T17:00:01Z");
    expect(t.status).toBe("onsale");
    expect(t.next).toBeNull();
  });

  it("shows West Coast shows in Pacific time for the same noon-local sale", () => {
    expect(fmtDateTime("2026-10-22T19:00:00Z", "America/Los_Angeles")).toBe("Oct 22, 12:00 PM PDT");
  });
});
