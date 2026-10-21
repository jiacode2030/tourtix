import { describe, expect, it } from "vitest";
import { fmtDateTime, zonedTimeToUtc } from "./format";

describe("zonedTimeToUtc", () => {
  it("handles standard and daylight time", () => {
    expect(zonedTimeToUtc("2026-12-05", "20:00:00", "America/Los_Angeles").toISOString()).toBe("2026-12-06T04:00:00.000Z");
    expect(zonedTimeToUtc("2026-07-04", "19:30:00", "America/New_York").toISOString()).toBe("2026-07-04T23:30:00.000Z");
  });
});

describe("fmtDateTime", () => {
  it("shows times in the venue's time zone with its abbreviation", () => {
    expect(fmtDateTime("2026-10-28T17:00:00Z", "America/Los_Angeles")).toBe("Oct 28, 10:00 AM PDT");
  });
});
