import { describe, expect, it } from "vitest";
import { livePresales } from "./live";
import { presaleDisplayName, presaleKey } from "./presale-names";
import { makeShow } from "./test-helpers";

describe("presale names", () => {
  it("treats Ticketmaster's spelling variants as the same presale", () => {
    expect(presaleKey("LIVE NATION PRESALE")).toBe(presaleKey("Live Nation Presale"));
    expect(presaleKey("VIP Package Presale")).toBe(presaleKey("VIP Packages Presale"));
    expect(presaleKey("Artist Presale")).not.toBe(presaleKey("Venue Presale"));
  });

  it("tidies all-caps names and leaves mixed case alone", () => {
    expect(presaleDisplayName("LIVE NATION PRESALE")).toBe("Live Nation Presale");
    expect(presaleDisplayName("RESERVED BY SPOTIFY")).toBe("Reserved by Spotify");
    expect(presaleDisplayName("VIP PACKAGE PRESALE")).toBe("VIP Package Presale");
    expect(presaleDisplayName("Artist VIP Packages Presale")).toBe("Artist VIP Packages Presale");
  });

  it("merges variants into one live presale across shows", () => {
    const p = (name: string) => ({ name, start: "2026-10-21T16:00:00Z", end: "2026-10-22T15:45:00Z", url: null, description: null });
    const a = makeShow({ id: "a", publicSaleStart: "2026-10-22T16:00:00Z", presales: [p("VIP Package Presale")] });
    const b = makeShow({ id: "b", publicSaleStart: "2026-10-22T16:00:00Z", presales: [p("VIP Packages Presale")] });
    const live = livePresales([a, b], Date.parse("2026-10-22T04:00:00Z"));
    expect(live).toHaveLength(1);
    expect(live[0].shows).toHaveLength(2);
  });
});
