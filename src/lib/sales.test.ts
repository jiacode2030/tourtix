import { describe, expect, it } from "vitest";
import { groupDrops, upcomingSaleStarts } from "./sales";
import { makeShow } from "./test-helpers";

const now = Date.parse("2026-10-21T12:00:00Z");
const DAY = 86_400_000;

describe("upcomingSaleStarts", () => {
  const show = makeShow({
    publicSaleStart: "2026-10-25T17:00:00Z",
    presales: [
      { name: "Old presale", start: "2026-10-20T17:00:00Z", end: null, url: null, description: null },
      { name: "Fan presale", start: "2026-10-23T17:00:00Z", end: null, url: null, description: null },
    ],
  });

  it("lists only future starts inside the window, soonest first", () => {
    expect(upcomingSaleStarts(show, 7 * DAY, now).map((s) => s.label)).toEqual(["Fan presale", "General sale"]);
  });

  it("excludes starts beyond the window", () => {
    expect(upcomingSaleStarts(show, 3 * DAY, now).map((s) => s.label)).toEqual(["Fan presale"]);
  });
});

describe("groupDrops", () => {
  it("keeps one entry per artist with their soonest sale and counts the rest", () => {
    const a = (id: string, start: string) => ({
      artistId: "artist",
      artistName: "Artist",
      imageUrl: null,
      show: makeShow({ id, publicSaleStart: start }),
    });
    const drops = groupDrops([a("x", "2026-10-25T00:00:00Z"), a("y", "2026-10-23T00:00:00Z")], 7 * DAY, now);
    expect(drops).toHaveLength(1);
    expect(drops[0].show.id).toBe("y");
    expect(drops[0].moreShows).toBe(1);
  });

  it("shows the nearest show when several open at the same moment", () => {
    const at = (id: string, city: string) => ({
      artistId: "artist",
      artistName: "Artist",
      imageUrl: null,
      show: makeShow({ id, city, publicSaleStart: "2026-10-23T00:00:00Z" }),
    });
    const items = [at("oak", "Oakland"), at("ana", "Anaheim"), at("sd", "San Diego")];
    const near = (s: { city: string | null }) => s.city === "Anaheim";
    const drops = groupDrops(items, 7 * DAY, now, near);
    expect(drops[0].show.city).toBe("Anaheim");
    expect(drops[0].moreShows).toBe(2);
    // without a preference, behavior is unchanged
    expect(groupDrops(items, 7 * DAY, now)[0].show.city).toBe("Oakland");
  });

  it("never lets a nearby show with a later sale replace an earlier one", () => {
    const mk = (id: string, city: string, start: string) => ({
      artistId: "artist",
      artistName: "Artist",
      imageUrl: null,
      show: makeShow({ id, city, publicSaleStart: start }),
    });
    const drops = groupDrops([mk("far", "Oakland", "2026-10-23T00:00:00Z"), mk("near", "Anaheim", "2026-10-25T00:00:00Z")], 7 * DAY, now, (s) => s.city === "Anaheim");
    expect(drops[0].show.id).toBe("far");
  });
});
