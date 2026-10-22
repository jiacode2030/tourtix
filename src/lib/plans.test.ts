import { describe, expect, it } from "vitest";
import { addPlan, parsePlans, removePlan, serializePlans, splitPlans, type Plan } from "./plans";

const plan = (id: string, date: string, over: Partial<Plan> = {}): Plan => ({
  id,
  artistId: "K1",
  artistName: "Calvin Harris",
  date,
  city: "Las Vegas",
  venue: null,
  ...over,
});

describe("parsePlans", () => {
  it("round-trips valid plans, soonest first", () => {
    const plans = [plan("b", "2026-12-01"), plan("a", "2026-11-01")];
    expect(parsePlans(serializePlans(plans)).map((p) => p.id)).toEqual(["a", "b"]);
  });

  it("survives junk in local storage", () => {
    expect(parsePlans(null)).toEqual([]);
    expect(parsePlans("")).toEqual([]);
    expect(parsePlans("not json")).toEqual([]);
    expect(parsePlans('{"a":1}')).toEqual([]);
    expect(parsePlans("[1,null,\"x\",[]]")).toEqual([]);
  });

  it("drops entries with bad ids, names, or dates, and de-duplicates", () => {
    const raw = JSON.stringify([
      plan("ok", "2026-11-01"),
      plan("ok", "2026-11-02"), // duplicate id
      plan("bad id!", "2026-11-01"),
      plan("nodate", "2026-02-31"),
      { ...plan("noname", "2026-11-01"), artistName: "   " },
      plan("../x", "2026-11-01"),
    ]);
    expect(parsePlans(raw).map((p) => p.id)).toEqual(["ok"]);
  });

  it("trims and limits text, and ignores a malformed artist id", () => {
    const [p] = parsePlans(JSON.stringify([plan("a", "2026-11-01", { artistName: " x ".repeat(100), city: "c".repeat(300), artistId: "../../etc" })]));
    expect(p.artistName.length).toBeLessThanOrEqual(100);
    expect(p.city!.length).toBe(80);
    expect(p.artistId).toBeNull();
  });

  it("never keeps more than 100 plans", () => {
    const many = Array.from({ length: 150 }, (_, i) => plan(`p${i}`, "2027-01-01"));
    expect(parsePlans(JSON.stringify(many))).toHaveLength(100);
  });
});

describe("add and remove", () => {
  it("adds once and replaces a repeat", () => {
    const a = addPlan([], plan("a", "2026-11-01"));
    expect(addPlan(a, plan("a", "2026-11-01", { city: "Reno" }))).toHaveLength(1);
    expect(removePlan(a, "a")).toEqual([]);
    expect(removePlan(a, "zzz")).toHaveLength(1);
  });
});

describe("splitPlans", () => {
  const now = Date.parse("2026-10-23T12:00:00Z");
  it("asks \"Did you go?\" only once the show is well over", () => {
    const { over, upcoming } = splitPlans(
      [plan("old", "2026-10-20"), plan("lastnight", "2026-10-22"), plan("today", "2026-10-23"), plan("later", "2026-11-05")],
      now,
    );
    // cutoff = 36h before now = 2026-10-22 00:00Z -> date 2026-10-22
    expect(over.map((p) => p.id)).toEqual(["old", "lastnight"]);
    expect(upcoming.map((p) => p.id)).toEqual(["today", "later"]);
  });
  it("doesn't ask on the night itself", () => {
    expect(splitPlans([plan("tonight", "2026-10-23")], Date.parse("2026-10-23T05:00:00Z")).over).toEqual([]);
  });
});
