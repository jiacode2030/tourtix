import { describe, expect, it } from "vitest";
import { ALL_FAQS, faqJsonLd } from "./faq";

describe("FAQ", () => {
  it("has unique ids, so links like /faq#verified-fan always land in one place", () => {
    const ids = ALL_FAQS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("never claims things the site must not do", () => {
    const text = ALL_FAQS.map((f) => f.a).join(" ");
    expect(text).toMatch(/never share presale codes/i);
    expect(text).toMatch(/can't show them/i); // registration deadlines aren't in the data
    expect(text).not.toMatch(/we guarantee|guaranteed|you will get/i);
  });

  it("only links to pages that exist on the site", () => {
    const known = ["/settings", "/help/notifications", "/tips", "/privacy", "/contact"];
    for (const f of ALL_FAQS) if (f.link) expect(known.some((k) => f.link!.href.startsWith(k))).toBe(true);
  });

  it("produces valid FAQ markup that can't break out of its script tag", () => {
    const json = faqJsonLd();
    expect(json).not.toContain("<");
    const data = JSON.parse(json);
    expect(data["@type"]).toBe("FAQPage");
    expect(data.mainEntity).toHaveLength(ALL_FAQS.length);
  });
});
