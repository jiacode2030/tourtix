import { describe, expect, it } from "vitest";
import { dedupeByName, matchTyped, mergeArtists, nameScore, rankArtists } from "./rank";
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
    expect(nameScore("beyonce", "Beyoncé")).toBe(92);
    expect(nameScore("fred again", "Fred again..")).toBeGreaterThanOrEqual(85);
    expect(nameScore("tyler the creator", "Tyler, The Creator")).toBe(92);
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

describe("popularity vs exact names", () => {
  it("lets a famous artist beat an obscure artist who has exactly the typed name", () => {
    const ranked = names(rankArtists("olivia", [a("Olivia", 1), a("Olivia Rodrigo", 60)]));
    expect(ranked[0]).toBe("Olivia Rodrigo");
  });
});

describe("dedupeByName", () => {
  it("keeps the best known of several entries with the same name", () => {
    const out = dedupeByName([a("Noah", 0, "n1"), a("NOAH", 5, "n2"), a("Noah", 1, "n3"), a("Noah Kahan", 30)]);
    expect(out.map((x) => x.id)).toEqual(["n2", "Noah Kahan"]);
  });
});

describe("mergeArtists", () => {
  it("keeps one entry per id, with the highest show count and any photo found", () => {
    const merged = mergeArtists([{ ...a("Calvin Harris", 9, "x"), imageUrl: null }], [{ ...a("Calvin Harris", 0, "x"), imageUrl: "https://img" }]);
    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({ upcomingShows: 9, imageUrl: "https://img" });
  });
});

describe("matchTyped (partial names from the lookup list)", () => {
  const pool = [a("Taylor Swift", 50), a("Taylor Acorn", 1), a("Ed Sheeran", 40), a("Bad Bunny", 60), a("Post Malone", 35), a("Calvin Harris", 40)];
  it("finds artists from unfinished words Ticketmaster's search can't match", () => {
    expect(names(matchTyped("taylor sw", pool))).toEqual(["Taylor Swift"]);
    expect(names(matchTyped("ed sh", pool))).toEqual(["Ed Sheeran"]);
    expect(names(matchTyped("bad bun", pool))).toEqual(["Bad Bunny"]);
    expect(names(matchTyped("post m", pool))).toEqual(["Post Malone"]);
    expect(names(matchTyped("calv", pool))).toEqual(["Calvin Harris"]);
  });
  it("returns nothing for text that matches no one", () => {
    expect(matchTyped("zzzz", pool)).toEqual([]);
  });
});

describe("notability", () => {
  const withN = (name: string, upcomingShows: number, notability: number): Artist => ({ ...a(name, upcomingShows), notability });
  it("ranks a famous artist between tours above a lesser-known act with a similar name", () => {
    const ranked = names(rankArtists("sabrina", [withN("Sabrina Claudio", 8, 3), withN("Sabrina Carpenter", 0, 12)]));
    expect(ranked[0]).toBe("Sabrina Carpenter");
  });
  it("never lets fame beat a clearly better name match", () => {
    const ranked = names(rankArtists("calvin harris", [withN("Harris Brothers", 20, 12), withN("Calvin Harris", 0, 0)]));
    expect(ranked[0]).toBe("Calvin Harris");
  });
  it("keeps the best of each field when merging", () => {
    const merged = mergeArtists([withN("X", 3, 2)], [withN("X", 1, 9)]);
    expect(merged[0]).toMatchObject({ upcomingShows: 3, notability: 9 });
  });
});
