// Ticketmaster data quirks that could make countdowns wrong for any artist.
import { describe, expect, it } from "vitest";
import { upcomingSaleStarts } from "./sales";
import { computeStatus } from "./status";
import { makeShow } from "./test-helpers";
import { _test } from "./ticketmaster";

const now = Date.parse("2026-10-21T12:00:00Z");
const FOREVER = Number.MAX_SAFE_INTEGER;
const future = "2026-10-25T17:00:00Z";

describe("countdown edge cases", () => {
  it.each(["cancelled", "offsale", "postponed"] as const)("shows no countdown for %s shows", (status) => {
    expect(upcomingSaleStarts(makeShow({ status, publicSaleStart: future }), FOREVER, now)).toEqual([]);
  });

  it("recognizes postponed shows", () => {
    expect(computeStatus("postponed", future, [], new Date(now))).toBe("postponed");
  });

  it("treats Ticketmaster's 1900 placeholder dates as unknown", () => {
    const show = _test.toShow({
      id: "e1",
      name: "Test",
      dates: { start: { localDate: "2027-03-01" }, status: { code: "onsale" }, timezone: "America/New_York" },
      sales: {
        public: { startDateTime: "1900-01-01T18:00:00Z", startTBD: false },
        presales: [{ name: "Fan Presale", startDateTime: "1900-01-01T00:00:00Z" }],
      },
      _embedded: { venues: [{ name: "Arena", city: { name: "Boston" }, state: { stateCode: "MA" } }] },
    });
    expect(show.publicSaleStart).toBeNull();
    expect(show.presales[0].start).toBeNull();
    expect(upcomingSaleStarts(show, FOREVER, now)).toEqual([]);
  });

  it("ignores sales marked to-be-announced", () => {
    const show = _test.toShow({
      id: "e2",
      dates: { start: { localDate: "2027-03-01" }, status: { code: "onsale" } },
      sales: { public: { startDateTime: future, startTBD: true } },
    });
    expect(show.publicSaleStart).toBeNull();
  });

  it("skips presales that already started and counts down to the next one", () => {
    const show = makeShow({
      publicSaleStart: "2026-10-23T17:00:00Z",
      presales: [
        { name: "Started", start: "2026-10-20T17:00:00Z", end: "2026-10-22T17:00:00Z", url: null, description: null },
        { name: "Later", start: "2026-10-22T17:00:00Z", end: null, url: null, description: null },
      ],
    });
    expect(upcomingSaleStarts(show, FOREVER, now).map((s) => s.label)).toEqual(["Later", "General sale"]);
  });

  it("counts down months ahead without breaking", () => {
    const show = makeShow({ publicSaleStart: "2027-03-01T17:00:00Z" });
    expect(upcomingSaleStarts(show, FOREVER, now)).toHaveLength(1);
  });
});
