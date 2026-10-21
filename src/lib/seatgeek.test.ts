import { describe, expect, it } from "vitest";
import { mergeShows } from "./seatgeek";
import { makeShow } from "./test-helpers";

const link = (seller: string) => ({ seller, url: `https://${seller}.example`, allInPrice: null, currency: null });

describe("mergeShows", () => {
  it("merges the same date and city into one show with both sellers", () => {
    const tm = [makeShow({ id: "t1", city: "Los Angeles", links: [link("Ticketmaster")] })];
    const sg = [makeShow({ id: "s1", city: "los angeles", links: [link("SeatGeek")] })];
    const out = mergeShows(tm, sg);
    expect(out).toHaveLength(1);
    expect(out[0].links.map((l) => l.seller)).toEqual(["Ticketmaster", "SeatGeek"]);
  });

  it("adds shows only the second seller has, sorted by date", () => {
    const tm = [makeShow({ id: "t1", date: "2026-12-05", links: [link("Ticketmaster")] })];
    const sg = [makeShow({ id: "s2", date: "2026-11-01", city: "Miami", links: [link("SeatGeek")] })];
    expect(mergeShows(tm, sg).map((s) => s.id)).toEqual(["s2", "t1"]);
  });

  it("does not modify the input shows", () => {
    const tm = [makeShow({ links: [link("Ticketmaster")] })];
    mergeShows(tm, [makeShow({ links: [link("SeatGeek")] })]);
    expect(tm[0].links).toHaveLength(1);
  });
});
