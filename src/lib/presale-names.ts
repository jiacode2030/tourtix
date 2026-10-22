// Ticketmaster names the same presale differently across a tour's shows
// ("LIVE NATION PRESALE" vs "Live Nation Presale", "VIP Package Presale" vs
// "VIP Packages Presale"). These helpers merge them and tidy the display.

const SMALL_WORDS = new Set(["by", "and", "of", "the", "for", "a", "an", "to"]);
const KEEP_UPPER = new Set(["VIP", "AMEX", "LN", "US", "UK", "NBA", "NFL", "MLB", "NHL"]);

// Key for grouping: case, punctuation, and plural "packages" don't matter.
export function presaleKey(name: string) {
  return name
    .toLowerCase()
    .replace(/packages/g, "package")
    .replace(/[^a-z0-9]/g, "");
}

// "LIVE NATION PRESALE" -> "Live Nation Presale"; leaves mixed case alone.
export function presaleDisplayName(name: string) {
  if (name !== name.toUpperCase()) return name;
  return name
    .split(/\s+/)
    .map((word, i) => {
      if (KEEP_UPPER.has(word)) return word;
      const lower = word.toLowerCase();
      if (i > 0 && SMALL_WORDS.has(lower)) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}
