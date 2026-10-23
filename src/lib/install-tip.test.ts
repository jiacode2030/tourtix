import { describe, expect, it } from "vitest";
import { SNOOZE_MS, isIos, showInstallTip } from "./install-tip";

const now = 1_800_000_000_000;

describe("isIos", () => {
  it("spots iPhones and iPads", () => {
    expect(isIos("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari")).toBe(true);
    expect(isIos("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)")).toBe(true);
  });
  it("spots an iPad in desktop mode but not a real Mac", () => {
    expect(isIos("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 5)).toBe(true);
    expect(isIos("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)", 0)).toBe(false);
  });
  it("is false on Android and Windows", () => {
    expect(isIos("Mozilla/5.0 (Linux; Android 14)")).toBe(false);
    expect(isIos("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")).toBe(false);
  });
});

describe("showInstallTip", () => {
  it("shows on iPhone in the browser", () => {
    expect(showInstallTip({ ios: true, standalone: false, dismissedAt: null, now })).toBe(true);
  });
  it("hides once installed or on other devices", () => {
    expect(showInstallTip({ ios: true, standalone: true, dismissedAt: null, now })).toBe(false);
    expect(showInstallTip({ ios: false, standalone: false, dismissedAt: null, now })).toBe(false);
  });
  it("stays hidden for 30 days after dismissing, then returns", () => {
    expect(showInstallTip({ ios: true, standalone: false, dismissedAt: String(now - 1000), now })).toBe(false);
    expect(showInstallTip({ ios: true, standalone: false, dismissedAt: String(now - SNOOZE_MS - 1), now })).toBe(true);
  });
  it("ignores a garbled saved value", () => {
    expect(showInstallTip({ ios: true, standalone: false, dismissedAt: "abc", now })).toBe(true);
  });
});
