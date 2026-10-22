import { describe, expect, it } from "vitest";
import { presaleHelp } from "./presale-help";

describe("presaleHelp", () => {
  it("matches common presale types", () => {
    expect(presaleHelp("Live Nation Presale")).toMatch(/livenation\.com/);
    expect(presaleHelp("Reserved by Spotify")).toMatch(/Spotify/);
    expect(presaleHelp("Artist Presale")).toMatch(/official website/);
    expect(presaleHelp("Citi Cardmember Presale")).toMatch(/card/);
    expect(presaleHelp("Verified Fan Presale")).toMatch(/Verified Fan/);
    expect(presaleHelp("Artist VIP Packages Presale")).toMatch(/packages/i);
  });

  it("falls back to pointing at the seller, and never mentions codes it doesn't know", () => {
    expect(presaleHelp("Mystery Presale")).toMatch(/seller's presale details/);
  });
});
