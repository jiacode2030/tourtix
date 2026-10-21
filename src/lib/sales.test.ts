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
});
