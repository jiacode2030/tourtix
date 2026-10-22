import { describe, expect, it } from "vitest";
import { cleanUrl, sellerName } from "./links";

describe("cleanUrl", () => {
  it("keeps normal web links", () => {
    expect(cleanUrl("https://www.ticketmaster.com/event/Z7r9jZ1A7PKv6")).toBe("https://www.ticketmaster.com/event/Z7r9jZ1A7PKv6");
  });

  it("drops anything that isn't http(s) or isn't a link", () => {
    expect(cleanUrl("javascript:alert(1)")).toBeNull();
    expect(cleanUrl("data:text/html,hi")).toBeNull();
    expect(cleanUrl("not a url")).toBeNull();
    expect(cleanUrl(null)).toBeNull();
    expect(cleanUrl("")).toBeNull();
  });

  it("unwraps Proofpoint URL Defense links seen in real Amex presale text", () => {
    const wrapped =
      "https://urldefense.com/v3/__https:/www.americanexpress.com/entertainment/home/__;!!GeIQSb45FBw!qW7IG0i4WYtQkBthP7StRNtUonlLhKpeLaYcuK0Jhbvnnfk_mbEx-L56mWNNvEAnTj_GII3atxTzy9LFVKyKb_UuXAQ1geJhnn5g$";
    expect(cleanUrl(wrapped)).toBe("https://www.americanexpress.com/entertainment/home/");
  });

  it("rejects a wrapper that hides a non-web link", () => {
    expect(cleanUrl("https://urldefense.com/v3/__javascript:alert(1)__;!!x$")).toBeNull();
  });
});

describe("sellerName", () => {
  it("names Ticketmaster only for real Ticketmaster links", () => {
    expect(sellerName("https://www.ticketmaster.com/event/1")).toBe("Ticketmaster");
    expect(sellerName("https://www.ticketmaster.co.uk/event/1")).toBe("Ticketmaster");
    expect(sellerName("https://www.ticketmaster.com.au/event/1")).toBe("Ticketmaster");
    expect(sellerName("https://www.livenation.com/event/1")).toBe("Live Nation");
  });

  it("uses the site's own name for other sellers, and can't be fooled by lookalikes", () => {
    expect(sellerName("https://www.gofevo.com/event/metallica")).toBe("gofevo.com");
    expect(sellerName("https://on.fgtix.com/x")).toBe("on.fgtix.com");
    expect(sellerName("https://ticketmaster.com.evil.example/x")).toBe("ticketmaster.com.evil.example");
    expect(sellerName("https://notticketmaster.com/x")).toBe("notticketmaster.com");
  });
});
