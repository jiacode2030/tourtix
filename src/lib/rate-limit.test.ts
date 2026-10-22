import { describe, expect, it } from "vitest";
import { allow, clientIp } from "./rate-limit";

describe("allow", () => {
  it("lets normal use through and blocks a flood, per visitor", () => {
    const t = 1_000_000;
    for (let i = 0; i < 5; i++) expect(allow("a", 5, 60_000, t + i)).toBe(true);
    expect(allow("a", 5, 60_000, t + 10)).toBe(false);
    expect(allow("b", 5, 60_000, t + 10)).toBe(true); // someone else is unaffected
  });

  it("starts fresh after the window passes", () => {
    const t = 5_000_000;
    for (let i = 0; i < 4; i++) allow("c", 3, 1_000, t);
    expect(allow("c", 3, 1_000, t)).toBe(false);
    expect(allow("c", 3, 1_000, t + 1_001)).toBe(true);
  });
});

describe("clientIp", () => {
  it("uses the first address the platform reports", () => {
    expect(clientIp(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" }))).toBe("203.0.113.7");
    expect(clientIp(new Headers({ "x-real-ip": "198.51.100.2" }))).toBe("198.51.100.2");
    expect(clientIp(new Headers())).toBe("unknown");
  });
});
