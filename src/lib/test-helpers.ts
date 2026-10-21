import type { Show } from "./types";

// Builds a Show with sensible defaults for tests.
export function makeShow(overrides: Partial<Show> = {}): Show {
  return {
    id: "s1",
    name: "Test",
    date: "2026-12-05",
    time: "20:00:00",
    timezone: "America/Los_Angeles",
    venue: "Test Arena",
    city: "Los Angeles",
    region: "CA",
    country: "US",
    links: [],
    status: "announced",
    publicSaleStart: null,
    presales: [],
    lat: null,
    lng: null,
    extras: {},
    ...overrides,
  };
}
