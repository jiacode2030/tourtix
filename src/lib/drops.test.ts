import { describe, expect, it } from "vitest";
import { nextDrop, saleTimeline, tourSummary } from "./drops";
import { makeShow } from "./test-helpers";

// Calvin Harris-style tour: every city opens at 12 PM local.
const presale = (name: string, start: string, end: string | null) => ({ name, start, end, url: null, description: null });
const chicago = makeShow({
  id: "chi",
  city: "Chicago",
  region: "IL",
  timezone: "America/Chicago",
  lat: 41.88,
  lng: -87.63,
  publicSaleStart: "2026-10-22T17:00:00Z", // 12 PM CDT
  presales: [presale("Live Nation Presale", "2026-10-21T17:00:00Z", "2026-10-22T15:00:00Z")],
});
const la = makeShow({
  id: "la",
  date: "2027-05-27",
  city: "Inglewood",
  region: "CA",
  timezone: "America/Los_Angeles",
  lat: 33.96,
  lng: -118.34,
  publicSaleStart: "2026-10-22T19:00:00Z", // 12 PM PDT
  presales: [presale("Live Nation Presale", "2026-10-21T19:00:00Z", "2026-10-22T17:00:00Z")],
});
const cancelled = makeShow({ id: "x", status: "cancelled", publicSaleStart: "2026-10-22T17:00:00Z" });

describe("nextDrop", () => {
  const afterPresales = Date.parse("2026-10-22T16:00:00Z");

  it("groups shows that open at the same local time across time zones", () => {
    const drop = nextDrop([la, chicago, cancelled], null, afterPresales)!;
    expect(drop.label).toBe("General sale");
    expect(drop.localTime).toBe("Thu, Oct 22, 12:00 PM");
    expect(drop.shows.map((d) => d.show.id)).toEqual(["chi", "la"]);
    expect(drop.focus.show.id).toBe("chi"); // earliest when location is unknown
  });

  it("focuses on the viewer's nearest show", () => {
    const losAngeles = { region: "CA", lat: 34.05, lng: -118.24, radiusMiles: 100 };
    expect(nextDrop([chicago, la], losAngeles, afterPresales)!.focus.show.id).toBe("la");
  });

  it("returns null when nothing is coming up", () => {
    expect(nextDrop([chicago, la], null, Date.parse("2026-10-23T00:00:00Z"))).toBeNull();
  });
});

describe("saleTimeline", () => {
  it("marks presales live or ended and the general sale upcoming", () => {
    const during = saleTimeline([chicago, la], Date.parse("2026-10-21T20:00:00Z"));
    expect(during).toEqual([
      { label: "Live Nation Presale", state: "live", start: null },
      { label: "General sale", state: "upcoming", start: "2026-10-22T17:00:00.000Z" },
    ]);
    const after = saleTimeline([chicago, la], Date.parse("2026-10-22T18:00:00Z"));
    expect(after.map((s) => s.state)).toEqual(["ended", "live"]);
  });
});

describe("tourSummary", () => {
  it("counts shows, date range, and nearby shows, ignoring cancelled ones", () => {
    const losAngeles = { region: "CA", lat: 34.05, lng: -118.24, radiusMiles: 100 };
    expect(tourSummary([chicago, la, cancelled], losAngeles)).toEqual({
      count: 2,
      firstDate: "2026-12-05",
      lastDate: "2027-05-27",
      near: 1,
    });
  });
});
