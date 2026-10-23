import { describe, expect, it } from "vitest";
import { PAGE_TIPS, TOUR_STEPS, pageKey, tipsFor } from "./help";

const ROUTES = ["/", "/my-artists", "/settings", "/passport", "/faq", "/concerts", "/tips", "/contact", "/help/notifications"];

describe("tour", () => {
  it("has unique steps with text, and covers the main features", () => {
    const ids = TOUR_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const s of TOUR_STEPS) {
      expect(s.title.length).toBeGreaterThan(3);
      expect(s.text.length).toBeGreaterThan(20);
    }
    for (const needed of ["find", "follow", "alerts", "presales", "passport", "help"]) expect(ids).toContain(needed);
  });

  it("only links to pages that exist", () => {
    for (const s of TOUR_STEPS) {
      if (!s.action) continue;
      const path = s.action.href.split("#")[0];
      expect(ROUTES).toContain(path);
    }
  });

  it("is honest about what TourTix is", () => {
    const all = TOUR_STEPS.map((s) => s.text).join(" ");
    expect(all).toMatch(/don't sell tickets/i);
    expect(all).toMatch(/private/i);
    expect(all).not.toMatch(/guarantee/i);
  });
});

describe("page tips", () => {
  it("picks the right tips for each page", () => {
    expect(pageKey("/")).toBe("home");
    expect(pageKey("/artists/K8vZ9175TJ0")).toBe("artist");
    expect(pageKey("/my-artists")).toBe("my-artists");
    expect(pageKey("/passport")).toBe("passport");
    expect(pageKey("/settings")).toBe("settings");
    expect(pageKey("/concerts")).toBe("concerts");
    expect(pageKey("/faq")).toBe("faq");
    expect(pageKey("/this-week")).toBe("this-week");
    expect(pageKey("/privacy")).toBe("other");
    expect(pageKey("/nope/at/all")).toBe("other");
  });

  it("has tips for every page type", () => {
    for (const [key, v] of Object.entries(PAGE_TIPS)) {
      expect(v.tips.length, key).toBeGreaterThan(0);
      for (const t of v.tips) expect(t.text.length).toBeGreaterThan(10);
    }
    expect(tipsFor("/passport").tips.some((t) => /private/i.test(`${t.title} ${t.text}`))).toBe(true);
  });
});
