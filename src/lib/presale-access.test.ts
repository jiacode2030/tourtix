import { describe, expect, it } from "vitest";
import { cleanMemberships, earliestForYou, presaleAccess } from "./presale-access";
import { makeShow } from "./test-helpers";

const kind = (name: string, mine: string[] = []) => presaleAccess(name, mine).kind;

describe("presaleAccess", () => {
  // Real presale names seen in Ticketmaster data.
  it("ties card and account presales to the matching membership", () => {
    expect(presaleAccess("Live Nation Presale")).toMatchObject({ kind: "member", key: "livenation" });
    expect(presaleAccess("Amex Presale Tickets®")).toMatchObject({ kind: "member", key: "amex" });
    expect(presaleAccess("Citi® Cardmember Presale")).toMatchObject({ kind: "member", key: "citi" });
    expect(presaleAccess("Reserved by Spotify")).toMatchObject({ kind: "member", key: "spotify" });
    expect(presaleAccess("Verizon Shine Select Seats")).toMatchObject({ kind: "member", key: "verizon" });
    expect(presaleAccess("SiriusXM Presale")).toMatchObject({ kind: "member", key: "siriusxm" });
    expect(presaleAccess("Ticketmaster Presale")).toMatchObject({ kind: "member", key: "ticketmaster" });
  });

  it("marks presales as yours only when that membership is ticked", () => {
    expect(kind("Amex Presale Tickets®", ["amex"])).toBe("yours");
    expect(kind("Amex Presale Tickets®", ["citi"])).toBe("member");
  });

  it("never says you qualify for presales that need a per-tour sign-up", () => {
    const all = ["livenation", "ticketmaster", "amex", "citi", "capitalone", "chase", "verizon", "siriusxm", "spotify"];
    for (const name of ["Ticketmaster Verified Fan Presale", "Artist Presale", "Venue Presale", "Legacy Member Presale", "Fifth Member Presale", "Official Fan Club Presale"]) {
      expect(kind(name, all)).toBe("signup");
    }
  });

  it("treats VIP packages as open to anyone, unless they need a fan club", () => {
    expect(kind("VIP Package Presale")).toBe("vip");
    expect(kind("On The List VIP Package Presale")).toBe("vip");
    expect(kind("Fifth Member VIP Packages Presale")).toBe("signup");
    expect(kind("Artist VIP Packages Presale")).toBe("signup");
    expect(kind("Frost Bank Center Presale")).toBe("signup");
    expect(kind("Friday 5:00 PM Onsale")).toBe("unknown");
  });
});

describe("cleanMemberships", () => {
  it("keeps only known keys, once each", () => {
    expect(cleanMemberships(["amex", "amex", "hacker", 5, "spotify"])).toEqual(["amex", "spotify"]);
  });
});

describe("earliestForYou", () => {
  const now = Date.parse("2026-10-22T12:00:00Z");
  const show = makeShow({
    publicSaleStart: "2026-10-30T17:00:00Z",
    presales: [
      { name: "Artist Presale", start: "2026-10-27T17:00:00Z", end: null, url: null, description: null },
      { name: "Citi Cardmember Presale", start: "2026-10-28T17:00:00Z", end: null, url: null, description: null },
      { name: "Live Nation Presale", start: "2026-10-29T17:00:00Z", end: null, url: null, description: null },
      { name: "Amex Presale", start: "2026-10-20T17:00:00Z", end: "2026-10-21T17:00:00Z", url: null, description: null },
    ],
  });

  it("picks the earliest presale the user can get into", () => {
    expect(earliestForYou(show, ["livenation", "citi"], now)?.name).toBe("Citi Cardmember Presale");
  });

  it("skips presales that already ended and ones needing sign-up", () => {
    expect(earliestForYou(show, ["amex"], now)).toBeNull();
  });

  it("returns nothing when the user hasn't ticked anything", () => {
    expect(earliestForYou(show, [], now)).toBeNull();
  });
});
