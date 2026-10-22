import { describe, expect, it } from "vitest";
import { isMusicGenre } from "./genres";

describe("isMusicGenre", () => {
  it("rejects non-music events that Ticketmaster files under music", () => {
    expect(isMusicGenre("Motorsports/Racing")).toBe(false);
    expect(isMusicGenre("Wrestling")).toBe(false);
    expect(isMusicGenre("Sports")).toBe(false);
  });
  it("keeps every kind of music, and artists with no genre", () => {
    for (const g of ["Pop", "Rock", "Hip-Hop/Rap", "Country", "Classical", "Metal", "Dance/Electronic", "R&B", "Latin", "Jazz", "Folk", "Reggae", "Alternative"]) {
      expect(isMusicGenre(g), g).toBe(true);
    }
    expect(isMusicGenre(null)).toBe(true);
    expect(isMusicGenre(undefined)).toBe(true);
  });
});
