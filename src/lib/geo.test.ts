import { describe, expect, it } from "vitest";
import { geohash, isNear, milesBetween } from "./geo";
import { makeShow } from "./test-helpers";

describe("geo", () => {
  it("computes distances in miles", () => {
    expect(Math.round(milesBetween(34.05, -118.24, 36.17, -115.14))).toBe(228);
  });

  it("encodes geohashes", () => {
    expect(geohash(57.64911, 10.40744, 11)).toBe("u4pruydqqvj");
  });

  it("uses distance when both locations are known", () => {
    const vegas = makeShow({ lat: 36.17, lng: -115.14, region: "NV" });
    const la = { region: "CA", lat: 34.05, lng: -118.24, radiusMiles: 100 };
    expect(isNear(vegas, la)).toBe(false);
    expect(isNear(vegas, { ...la, radiusMiles: 250 })).toBe(true);
  });

  it("falls back to the same US state", () => {
    const show = makeShow({ region: "CA" });
    expect(isNear(show, { region: "CA", lat: null, lng: null, radiusMiles: 100 })).toBe(true);
    expect(isNear(show, { region: "NV", lat: null, lng: null, radiusMiles: 100 })).toBe(false);
    expect(isNear(show, null)).toBe(false);
  });
});
