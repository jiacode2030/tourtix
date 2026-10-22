import { describe, expect, it } from "vitest";
import { justWentOnSale, livePresales } from "./live";
import { makeShow } from "./test-helpers";

const p = (name: string, start: string | null, end: string | null) => ({ name, start, end, url: null, description: null });
const now = Date.parse("2026-10-21T20:00:00Z");

describe("livePresales", () => {
  it("groups open presales by name and finds when they end", () => {
    const a = makeShow({ id: "a", presales: [p("Live Nation Presale", "2026-10-21T17:00:00Z", "2026-10-22T15:00:00Z")] });
    const b = makeShow({ id: "b", presales: [p("Live Nation Presale", "2026-10-21T19:00:00Z", "2026-10-22T17:00:00Z")] });
    const later = makeShow({ id: "c", presales: [p("Fan Presale", "2026-10-25T17:00:00Z", null)] });
    const [live] = livePresales([a, b, later], now);
    expect(live.label).toBe("Live Nation Presale");
    expect(live.shows.map((s) => s.id)).toEqual(["a", "b"]);
    expect(live.endsAt).toBe("2026-10-22T15:00:00Z");
    expect(livePresales([later], now)).toEqual([]);
  });

  it("treats a presale with no end as open until the general sale", () => {
    const open = makeShow({ publicSaleStart: "2026-10-22T17:00:00Z", presales: [p("Spotify", "2026-10-19T15:00:00Z", null)] });
    const over = makeShow({ publicSaleStart: "2026-10-21T17:00:00Z", presales: [p("Spotify", "2026-10-19T15:00:00Z", null)] });
    expect(livePresales([open], now)).toHaveLength(1);
    expect(livePresales([over], now)).toHaveLength(0);
  });

  it("ignores cancelled shows", () => {
    const c = makeShow({ status: "cancelled", presales: [p("X", "2026-10-21T10:00:00Z", "2026-10-23T10:00:00Z")] });
    expect(livePresales([c], now)).toEqual([]);
  });
});

describe("justWentOnSale", () => {
  it("finds general sales that started within the window", () => {
    const recent = makeShow({ id: "r", publicSaleStart: "2026-10-21T17:00:00Z" });
    const old = makeShow({ id: "o", publicSaleStart: "2026-10-10T17:00:00Z" });
    const future = makeShow({ id: "f", publicSaleStart: "2026-10-22T17:00:00Z" });
    expect(justWentOnSale([recent, old, future], 2 * 86_400_000, now).map((s) => s.id)).toEqual(["r"]);
  });
});
