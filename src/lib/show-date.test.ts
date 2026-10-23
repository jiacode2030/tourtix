import { describe, expect, it } from "vitest";
import { isOver } from "./show-date";

describe("isOver", () => {
  const morning = Date.parse("2026-10-23T17:00:00Z"); // 10am in Los Angeles

  it("hides a show from yesterday at the venue", () => {
    expect(isOver("2026-10-22", "America/Los_Angeles", morning)).toBe(true);
  });
  it("keeps a show happening today, even a late one", () => {
    expect(isOver("2026-10-23", "America/Los_Angeles", morning)).toBe(false);
    expect(isOver("2026-10-23", "America/Los_Angeles", Date.parse("2026-10-24T05:00:00Z"))).toBe(false);
  });
  it("uses the venue's date, not UTC", () => {
    const lateUtc = Date.parse("2026-10-24T03:00:00Z"); // still Oct 23 in Los Angeles
    expect(isOver("2026-10-23", "America/Los_Angeles", lateUtc)).toBe(false);
    expect(isOver("2026-10-23", "UTC", lateUtc)).toBe(true);
  });
  it("keeps future shows and shows with no date or a bad time zone", () => {
    expect(isOver("2026-12-01", "Europe/London", morning)).toBe(false);
    expect(isOver(null, null, morning)).toBe(false);
    expect(isOver("2026-10-22", "Not/AZone", morning)).toBe(true);
  });
});
