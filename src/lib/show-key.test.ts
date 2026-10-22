import { describe, expect, it } from "vitest";
import { sharedSlotIds } from "./show-key";

describe("sharedSlotIds", () => {
  it("flags listings that share a date and venue, like a regular ticket and a 2-day pass", () => {
    const shows = [
      { id: "a", date: "2026-10-22", venue: "Sphere" },
      { id: "b", date: "2026-10-22", venue: "Sphere" },
      { id: "c", date: "2026-10-24", venue: "Sphere" },
      { id: "d", date: "2026-10-22", venue: "Other Arena" },
    ];
    expect([...sharedSlotIds(shows)].sort()).toEqual(["a", "b"]);
  });

  it("flags nothing when every show is on its own date or venue", () => {
    expect(sharedSlotIds([{ id: "a", date: "2026-10-22", venue: "A" }, { id: "b", date: "2026-10-23", venue: "A" }]).size).toBe(0);
  });
});
