// Links come straight from ticket-site data, so they're cleaned before use:
// only web links are kept, email-security wrappers are removed, and the
// seller is named after where the link really goes.

// Proofpoint "URL Defense" wraps links like https://urldefense.com/v3/__<real link>__;!!token$
function unwrap(url: URL): string {
  if (/(^|\.)urldefense\.com$/.test(url.hostname)) {
    const m = url.href.match(/\/v3\/__(.+?)__;/);
    if (m) return m[1];
  }
  return url.href;
}

export function cleanUrl(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  try {
    const wrapped = new URL(raw.trim());
    if (!/^https?:$/.test(wrapped.protocol)) return null;
    const inner = new URL(unwrap(wrapped));
    return /^https?:$/.test(inner.protocol) ? inner.href : null;
  } catch {
    return null;
  }
}

// brand.com, brand.ca, brand.co.uk, brand.com.au, ... but never brand.com.something-else.
const OWN_DOMAIN = (brand: string) => new RegExp(`(^|\\.)${brand}\\.(?:[a-z]{2,3}|(?:co|com)\\.[a-z]{2})$`);

// "Ticketmaster" only when the link really goes to Ticketmaster (or Live Nation);
// otherwise the site's own name, so buttons never claim the wrong seller.
export function sellerName(url: string): string {
  const host = new URL(url).hostname.replace(/^www\./, "");
  if (OWN_DOMAIN("ticketmaster").test(host)) return "Ticketmaster";
  if (OWN_DOMAIN("livenation").test(host)) return "Live Nation";
  return host;
}
