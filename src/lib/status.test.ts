import { describe, expect, it } from "vitest";
import { computeStatus } from "./status";

const now = new Date("2026-10-21T12:00:00Z");
const presale = (start: string, end: string | null) => ({ name: "Fan", start, end, url: null, description: null });

describe("computeStatus", () => {
  it("respects cancelled, off sale and rescheduled codes", () => {
    expect(computeStatus("cancelled", null, [], now)).toBe("cancelled");
    expect(computeStatus("offsale", "2026-10-01T00:00:00Z", [], now)).toBe("offsale");
    expect(computeStatus("rescheduled", null, [], now)).toBe("rescheduled");
  });

  it("is on sale once the public sale has started", () => {
    expect(computeStatus("onsale", "2026-10-20T00:00:00Z", [], now)).toBe("onsale");
  });

  it("is in presale during an open presale window", () => {
    const p = [presale("2026-10-21T10:00:00Z", "2026-10-22T10:00:00Z")];
    expect(computeStatus("onsale", "2026-10-25T00:00:00Z", p, now)).toBe("presale");
  });

  it("is announced before any sale starts", () => {
    const p = [presale("2026-10-23T10:00:00Z", null)];
    expect(computeStatus("onsale", "2026-10-25T00:00:00Z", p, now)).toBe("announced");
  });

  it("is announced after a presale ends but before the public sale", () => {
    const p = [presale("2026-10-19T10:00:00Z", "2026-10-20T10:00:00Z")];
    expect(computeStatus("onsale", "2026-10-25T00:00:00Z", p, now)).toBe("announced");
  });
});
