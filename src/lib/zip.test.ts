import { describe, expect, it } from "vitest";
import { isZip, parseZipResponse } from "./zip";

describe("zip", () => {
  it("validates 5-digit ZIPs", () => {
    expect(isZip("90210")).toBe(true);
    expect(isZip("9021")).toBe(false);
    expect(isZip("90210-1234")).toBe(false);
  });

  it("parses Zippopotam.us responses", () => {
    const data = {
      "post code": "90210",
      country: "United States",
      places: [
        { "place name": "Beverly Hills", longitude: "-118.4065", state: "California", "state abbreviation": "CA", latitude: "34.0901" },
      ],
    };
    expect(parseZipResponse("90210", data)).toEqual({
      zip: "90210",
      city: "Beverly Hills",
      region: "CA",
      lat: 34.0901,
      lng: -118.4065,
    });
  });

  it("returns null for unknown or malformed responses", () => {
    expect(parseZipResponse("00000", {})).toBeNull();
    expect(parseZipResponse("00000", { places: [{ latitude: "x" }] })).toBeNull();
  });
});
