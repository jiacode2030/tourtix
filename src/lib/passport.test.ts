import { describe, expect, it } from "vitest";
import { parseStamp, passportStats, stampDate } from "./passport";

const NOW = Date.parse("2026-10-22T15:00:00Z");
const ok = (raw: Parameters<typeof parseStamp>[0]) => {
  const r = parseStamp(raw, NOW);
  if (!r.ok) throw new Error("expected ok, got " + r.error);
  return r.value;
};
const err = (raw: Parameters<typeof parseStamp>[0]) => {
  const r = parseStamp(raw, NOW);
  return r.ok ? "ok" : r.error;
};

describe("parseStamp", () => {
  it("accepts a normal stamp and tidies the text", () => {
    expect(ok({ artistName: "  Calvin   Harris ", date: "2026-05-30", city: " Los  Angeles ", venue: "" })).toEqual({
      artistName: "Calvin Harris",
      artistId: null,
      eventDate: "2026-05-30",
      city: "Los Angeles",
      venue: null,
    });
  });

  it("needs an artist name", () => {
    expect(err({ artistName: "   ", date: "2026-05-30" })).toBe("name");
    expect(err({ date: "2026-05-30" })).toBe("name");
  });

  it("rejects badly formed or impossible dates", () => {
    expect(err({ artistName: "A", date: "" })).toBe("date");
    expect(err({ artistName: "A", date: "30/05/2026" })).toBe("date");
    expect(err({ artistName: "A", date: "2026-02-31" })).toBe("date");
    expect(err({ artistName: "A", date: "2026-13-01" })).toBe("date");
  });

  it("is only for concerts you've been to: no dates in the future, none before 1950", () => {
    expect(err({ artistName: "A", date: "2026-10-22" })).toBe("ok"); // today
    expect(err({ artistName: "A", date: "2026-10-23" })).toBe("ok"); // a day of time-zone slack
    expect(err({ artistName: "A", date: "2026-10-24" })).toBe("future");
    expect(err({ artistName: "A", date: "2027-06-01" })).toBe("future");
    expect(err({ artistName: "A", date: "1949-12-31" })).toBe("old");
  });

  it("limits lengths and strips control characters", () => {
    const v = ok({ artistName: "x".repeat(300), date: "2026-01-01", city: "c".repeat(300), venue: "v".repeat(300) });
    expect(v.artistName).toHaveLength(100);
    expect(v.city).toHaveLength(80);
    expect(v.venue).toHaveLength(100);
    expect(ok({ artistName: "A\u0000B\nC", date: "2026-01-01" }).artistName).toBe("A B C");
  });

  it("keeps only well-formed Ticketmaster artist ids", () => {
    expect(ok({ artistName: "A", date: "2026-01-01", artistId: "K8vZ9175TJ0" }).artistId).toBe("K8vZ9175TJ0");
    expect(ok({ artistName: "A", date: "2026-01-01", artistId: "../../etc" }).artistId).toBeNull();
    expect(ok({ artistName: "A", date: "2026-01-01", artistId: "a".repeat(80) }).artistId).toBeNull();
    expect(ok({ artistName: "A", date: "2026-01-01", artistId: 5 }).artistId).toBeNull();
  });
});

describe("passportStats", () => {
  const stamps = [
    { artistName: "Calvin Harris", city: "Los Angeles", eventDate: "2026-05-30" },
    { artistName: "calvin harris", city: "Las Vegas", eventDate: "2024-07-01" },
    { artistName: "Dua Lipa", city: "los angeles", eventDate: "2025-03-10" },
    { artistName: "Metallica", city: null, eventDate: "2023-08-15" },
  ];

  it("counts concerts, artists and cities, ignoring case", () => {
    expect(passportStats(stamps)).toMatchObject({ concerts: 4, artists: 3, cities: 2, firstYear: 2023, lastYear: 2026 });
  });

  it("names a most-seen artist only when seen more than once", () => {
    expect(passportStats(stamps).topArtist).toEqual({ name: "Calvin Harris", count: 2 });
    expect(passportStats(stamps.slice(1)).topArtist).toBeNull();
  });

  it("handles an empty passport", () => {
    expect(passportStats([])).toEqual({ concerts: 0, artists: 0, cities: 0, firstYear: null, lastYear: null, topArtist: null });
  });
});

describe("stampDate", () => {
  it("formats without time zone shifts", () => {
    expect(stampDate("2026-05-30")).toBe("May 30, 2026");
    expect(stampDate("2026-01-01")).toBe("Jan 1, 2026");
    expect(stampDate("2026-05-30", "stamp")).toBe("MAY 30 '26");
  });
});
