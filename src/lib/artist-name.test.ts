import { describe, expect, it } from "vitest";
import { cleanArtistName } from "./artist-name";
import { nameScore } from "./rank";

describe("cleanArtistName", () => {
  it("keeps normal names, including ones with numbers and symbols", () => {
    for (const n of ["Calvin Harris", "AC/DC", "blink-182", "Fred again..", "Maroon 5", "21 Savage", "NF", "$uicideboy$"]) {
      expect(cleanArtistName(n)).toBe(n);
    }
  });
  it("rejects links and IDs shown in place of a name", () => {
    for (const n of ["/artists/K8vZ917Gbf0", "artists/K8vZ917Gbf0", "https://www.ticketmaster.com/x", "www.example.com", "K8vZ917Gbf0", "", "   ", null, undefined]) {
      expect(cleanArtistName(n)).toBeNull();
    }
  });
  it("shows JAY-Z the way people write it, and search still matches", () => {
    expect(cleanArtistName("JAŸ-Z")).toBe("JAY-Z");
    expect(nameScore("jay z", "JAŸ-Z")).toBeGreaterThanOrEqual(80);
    expect(nameScore("jay-z", "JAY-Z")).toBeGreaterThanOrEqual(80);
  });
  it("tidies stray spacing", () => {
    expect(cleanArtistName("  Dua   Lipa ")).toBe("Dua Lipa");
  });
});
