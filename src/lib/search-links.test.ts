import { describe, expect, it } from "vitest";
import { otherSiteSearches } from "./search-links";

describe("otherSiteSearches", () => {
  it("builds encoded searches and skips sellers already linked", () => {
    const links = otherSiteSearches("Calvin Harris", "Las Vegas", ["SeatGeek"]);
    expect(links.map((l) => l.name)).toEqual(["StubHub", "Vivid Seats"]);
    expect(links[0].url).toBe("https://www.stubhub.com/search?q=Calvin%20Harris%20Las%20Vegas");
  });

  it("never includes affiliate or tracking parameters", () => {
    for (const l of otherSiteSearches("A & B", null, [])) {
      expect(l.url).not.toMatch(/aff|ref=|utm_|clickid|irclickid/i);
    }
  });
});
