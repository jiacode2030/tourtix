import { describe, expect, it } from "vitest";
import { groupReminders, type Reminder } from "./alerts";
import { makeShow } from "./test-helpers";

const r = (id: string, tz: string, start: string, label = "General sale", stage: Reminder["stage"] = "soon"): Reminder => ({
  stage,
  label,
  start,
  show: makeShow({ id, timezone: tz }),
});

describe("groupReminders", () => {
  it("sends one reminder for a whole tour opening at the same local time", () => {
    const tour = [
      r("bos", "America/New_York", "2026-10-22T16:00:00Z"),
      r("phl", "America/New_York", "2026-10-22T16:00:00Z"),
      r("chi", "America/Chicago", "2026-10-22T17:00:00Z"),
      r("la", "America/Los_Angeles", "2026-10-22T19:00:00Z"),
    ];
    const groups = groupReminders(tour);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toHaveLength(4);
    expect(groups[0][0].show.id).toBe("bos"); // opens first
  });

  it("keeps different sales and stages apart, merging name variants", () => {
    const groups = groupReminders([
      r("a", "America/New_York", "2026-10-21T16:00:00Z", "LIVE NATION PRESALE"),
      r("b", "America/New_York", "2026-10-21T16:00:00Z", "Live Nation Presale"),
      r("c", "America/New_York", "2026-10-22T16:00:00Z", "General sale"),
      r("d", "America/New_York", "2026-10-22T16:00:00Z", "General sale", "day"),
    ]);
    expect(groups.map((g) => g.length).sort()).toEqual([1, 1, 2]);
  });
});
