// Ticketmaster's real data for Calvin Harris's Boston show on Oct 22, 2026:
// status "offsale" before the general sale, and a "VIP Package Onsale" listed
// as a presale starting with the general sale.
import { describe, expect, it } from "vitest";
import { nextDrop, saleTimeline } from "./drops";
import { livePresales } from "./live";
import { upcomingSaleStarts } from "./sales";
import { computeStatus } from "./status";
import { makeShow } from "./test-helpers";

const p = (name: string, start: string, end: string) => ({ name, start, end, url: null, description: null });
const presales = [
  p("Reserved by Spotify", "2026-10-19T14:00:00Z", "2026-10-20T14:00:00Z"),
  p("Artist Presale", "2026-10-20T16:00:00Z", "2026-10-22T14:00:00Z"),
  p("Artist VIP Packages Presale", "2026-10-20T16:00:00Z", "2026-10-21T15:45:00Z"),
  p("VIP Package Presale", "2026-10-21T16:00:00Z", "2026-10-22T15:45:00Z"),
  p("VIP Package Onsale", "2026-10-22T16:00:00Z", "2027-03-28T16:00:00Z"),
  p("LIVE NATION PRESALE", "2026-10-21T16:00:00Z", "2026-10-22T14:00:00Z"),
];
const publicSaleStart = "2026-10-22T16:00:00Z";
const at = (iso: string) => new Date(iso);

describe("Ticketmaster 'offsale' before the general sale", () => {
  it("is a live presale overnight, counting down to the general sale", () => {
    const now = at("2026-10-22T04:13:00Z");
    const status = computeStatus("offsale", publicSaleStart, presales, now);
    expect(status).toBe("presale");
    const show = makeShow({ status, presales, publicSaleStart, timezone: "America/New_York" });
    expect(upcomingSaleStarts(show, Number.MAX_SAFE_INTEGER, now.getTime())[0].label).toBe("General sale");
    expect(nextDrop([show], null, now.getTime())?.label).toBe("General sale");
    const live = livePresales([show], now.getTime()).map((s) => s.label);
    expect(live).toContain("LIVE NATION PRESALE");
    expect(live).not.toContain("VIP Package Onsale");
    expect(saleTimeline([show], now.getTime()).map((s) => s.label)).not.toContain("VIP Package Onsale");
  });

  it("is announced between presales ending and the general sale", () => {
    expect(computeStatus("offsale", publicSaleStart, presales, at("2026-10-22T15:50:00Z"))).toBe("announced");
  });

  it("stays off sale once every sale has started", () => {
    expect(computeStatus("offsale", publicSaleStart, presales.slice(0, 4), at("2026-10-23T00:00:00Z"))).toBe("offsale");
  });
});
