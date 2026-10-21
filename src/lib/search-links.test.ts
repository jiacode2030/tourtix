import { describe, expect, it } from "vitest";
import { otherSiteSearches } from "./search-links";

describe("otherSiteSearches", () => {
  it("builds encoded site searches and skips sellers already linked", () => {
    const { resale } = otherSiteSearches("Calvin Harris", "Las Vegas", ["SeatGeek"]);
    expect(resale.map((l) => l.name)).toEqual(["StubHub", "Vivid Seats", "Gametime"]);
    expect(resale[0].url).toBe("https://www.stubhub.com/search?q=Calvin%20Harris%20Las%20Vegas");
  });

  it("falls back to a Google search limited to the site's domain", () => {
    const axs = otherSiteSearches("Calvin Harris", "Las Vegas", []).official.find((l) => l.name === "AXS")!;
    expect(axs.viaGoogle).toBe(true);
    expect(axs.url).toBe("https://www.google.com/search?q=Calvin%20Harris%20Las%20Vegas%20site%3Aaxs.com");
  });

  it("searches every domain a site uses", () => {
    const see = otherSiteSearches("Calvin Harris", null, []).official.find((l) => l.name === "See Tickets")!;
    expect(decodeURIComponent(see.url)).toContain("Calvin Harris site:seetickets.us OR site:seetickets.com");
  });

  it("lists only concert-focused official sellers", () => {
    const { official } = otherSiteSearches("Calvin Harris", null, []);
    expect(official.map((l) => l.name)).toEqual(["AXS", "DICE", "See Tickets"]);
  });

  it("never includes affiliate or tracking parameters", () => {
    const { resale, official } = otherSiteSearches("A & B", null, []);
    for (const l of [...resale, ...official]) {
      expect(l.url).not.toMatch(/aff|ref=|utm_|clickid|irclickid/i);
    }
  });
});
