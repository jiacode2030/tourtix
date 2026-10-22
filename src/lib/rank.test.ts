import { describe, expect, it } from "vitest";
import { nameScore, rankArtists } from "./rank";
import type { Artist } from "./types";

const a = (name: string, upcomingShows = 0, id = name): Artist => ({ id, name, imageUrl: null, genre: null, upcomingShows });
const names = (list: Artist[]) => list.map((x) => x.name);

describe("rankArtists", () => {
  it("puts Calvin Harris first for \"calvin\", ahead of tributes and other Calvins", () => {
    const results = [
      a("Calvin Johnson", 2),
      a("Ultimate Calvin Harris Tribute", 6),
      a("Calvin Richardson", 3),
      a("Calvin Harris", 40),
      a("Calvin Harris Experience", 4),
    ];
    expect(names(rankArtists("calvin", results))[0]).toBe("Calvin Harris");
    const ranked = names(rankArtists("calvin", results));
    expect(ranked.indexOf("Ultimate Calvin Harris Tribute")).toBeGreaterThan(ranked.indexOf("Calvin Richardson"));
  });

  it("matches partial words as you type", () => {
    expect(names(rankArtists("calv", [a("Dua Lipa", 30), a("Calvin Harris", 40)]))[0]).toBe("Calvin Harris");
    expect(names(rankArtists("taylor sw", [a("Taylor Hawkins Tribute", 5), a("Taylor Swift", 50)]))[0]).toBe("Taylor Swift");
  });

  it("finds an artist by last name or in any word order", () => {
    expect(names(rankArtists("harris", [a("Emmylou Harris", 5), a("Calvin Harris", 40)]))[0]).toBe("Calvin Harris");
    expect(nameScore("harris calvin", "Calvin Harris")).toBeGreaterThanOrEqual(70);
  });

  it("ignores case, accents and punctuation", () => {
    expect(nameScore("beyonce", "Beyoncé")).toBe(100);
    expect(nameScore("fred again", "Fred again..")).toBeGreaterThanOrEqual(85);
    expect(nameScore("tyler the creator", "Tyler, The Creator")).toBe(100);
    expect(nameScore("acdc", "AC/DC")).toBeGreaterThanOrEqual(80);
    expect(nameScore("blink182", "blink-182")).toBeGreaterThanOrEqual(80);
  });

  it("keeps tributes when the person is clearly searching for one", () => {
    const results = [a("Coldplay", 30), a("Ultimate Coldplay", 8)];
    expect(names(rankArtists("coldplay tribute", results))).toContain("Ultimate Coldplay");
    expect(names(rankArtists("ultimate coldplay", results))[0]).toBe("Ultimate Coldplay");
  });

  it("uses popularity to order equally good name matches, and keeps the source order for true ties", () => {
    expect(names(rankArtists("john", [a("John Smith", 1), a("John Legend", 30)]))[0]).toBe("John Legend");
    expect(names(rankArtists("zzz", [a("First"), a("Second")]))).toEqual(["First", "Second"]);
  });

  it("returns every artist (ranking never drops results)", () => {
    expect(rankArtists("calvin", [a("A"), a("B"), a("Calvin Harris")])).toHaveLength(3);
  });
});
