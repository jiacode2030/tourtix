import { describe, expect, it } from "vitest";
import { otherSiteSearches } from "./search-links";

describe("otherSiteSearches", () => {
  it("builds encoded site searches and skips sellers already linked", () => {
    const { resale } = otherSiteSearches("Calvin Harris", "Las Vegas", ["SeatGeek"]);
    expect(resale.map((l) => l.name)).toEqual(["StubHub", "Vivid Seats", "Gametime"]);
    expect(resale[0].url).toBe("https://www.stubhub.com/search?q=Calvin%20Harris%20Las%20Vegas");
  });

  it("matches AXS's own search URL format", () => {
    const [axs] = otherSiteSearches("Calvin Harris", "Las Vegas", []).official;
    expect(axs.url).toBe("https://www.axs.com/search?searchQuery=calvin%2520harris");
  });

  it("links straight to ticket sites, never through Google", () => {
    const { resale, official } = otherSiteSearches("Calvin Harris", "Las Vegas", []);
    for (const l of [...resale, ...official]) expect(l.url).not.toContain("google.com");
  });

  it("never includes affiliate or tracking parameters", () => {
    const { resale, official } = otherSiteSearches("A & B", null, []);
    for (const l of [...resale, ...official]) {
      expect(l.url).not.toMatch(/aff|ref=|utm_|clickid|irclickid/i);
    }
  });
});
