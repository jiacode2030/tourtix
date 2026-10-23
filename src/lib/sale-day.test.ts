import { describe, expect, it } from "vitest";
import { isSaleDay } from "./sale-day";

const now = Date.parse("2026-10-27T17:00:00Z");
const at = (hours: number) => new Date(now + hours * 3600_000).toISOString();

describe("isSaleDay", () => {
  it("is true for a sale in the next 24 hours", () => {
    expect(isSaleDay(at(0.5), now)).toBe(true);
    expect(isSaleDay(at(24), now)).toBe(true);
  });
  it("is false for a sale more than a day away", () => {
    expect(isSaleDay(at(24.5), now)).toBe(false);
    expect(isSaleDay(at(24 * 7), now)).toBe(false);
  });
  it("stays on for an hour after the sale opens, then stops", () => {
    expect(isSaleDay(at(-0.5), now)).toBe(true);
    expect(isSaleDay(at(-2), now)).toBe(false);
  });
  it("ignores bad dates", () => {
    expect(isSaleDay("nope", now)).toBe(false);
  });
});
