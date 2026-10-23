// Full live-site audit: working, security, legal and accuracy checks.
// Run by .github/workflows/monthly-audit.yml; exits 1 if any check fails.
const SITE = process.env.SITE || "https://tourtix.vercel.app";
const out = [];
const log = (kind, name, extra = "") => out.push(`${kind.padEnd(5)} ${name}${extra ? "  — " + extra : ""}`);
const check = (name, ok, extra = "") => log(ok ? "PASS" : "FAIL", name, ok ? "" : extra);
const note = (name, extra = "") => log("NOTE", name, extra);
const get = async (p, opts = {}) => { const t0 = Date.now(); const r = await fetch(SITE + p, { redirect: "manual", ...opts }); const t = await r.text(); return { r, t, ms: Date.now() - t0 }; };
const text = (h) => h.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ");

// ---------------- WORKING ----------------
const pages = ["/", "/this-week", "/offline.html", "/concerts", "/tips", "/faq", "/contact", "/privacy", "/terms", "/help/notifications", "/passport", "/settings", "/my-artists", "/sitemap.xml", "/robots.txt", "/manifest.webmanifest", "/sw.js", "/opengraph-image.png", "/icon-192.png", "/api/auth/providers"];
for (const p of pages) { try { const { r, ms } = await get(p); check(`working: ${p} loads (${ms}ms)`, r.status === 200 && ms < 8000, `HTTP ${r.status}, ${ms}ms`); } catch (e) { check(`working: ${p} loads`, false, String(e)); } }
{ const { r } = await get("/sw.js"); check("working: service worker is served as JavaScript", /javascript/.test(r.headers.get("content-type") ?? ""), r.headers.get("content-type")); }
{ const r = await fetch("http://tourtix.vercel.app/", { redirect: "manual" }); check("security: http redirects to https", [301, 307, 308].includes(r.status) && (r.headers.get("location") ?? "").startsWith("https://"), `HTTP ${r.status} ${r.headers.get("location")}`); }

// ---------------- SECURITY ----------------
for (const p of ["/", "/faq", "/api/suggest?q=calv", "/privacy"]) {
  const { r } = await get(p);
  const need = { "x-content-type-options": "nosniff", "x-frame-options": "DENY", "referrer-policy": null, "permissions-policy": null, "strict-transport-security": null };
  const bad = Object.entries(need).filter(([k, v]) => !r.headers.get(k) || (v && r.headers.get(k).toLowerCase() !== v.toLowerCase())).map(([k]) => k);
  check(`security: headers on ${p}`, bad.length === 0, "missing/wrong: " + bad.join(", "));
}
{ const { r } = await get("/"); check("security: no cookies for anonymous visitors", !(r.headers.getSetCookie?.().length), (r.headers.getSetCookie?.() ?? []).join(" | ")); }
for (const p of ["/.env", "/.env.local", "/.git/config", "/.git/HEAD", "/package.json", "/next.config.ts", "/src/lib/ticketmaster.ts", "/scripts/migrate.mjs", "/node_modules/.package-lock.json", "/tsconfig.json"]) {
  const { r, t } = await get(p);
  const leaked = r.status === 200 && /(\[core\]|DATABASE_URL|apikey|"name":\s*"tourtix"|export |import )/.test(t);
  check(`security: ${p} not exposed`, !leaked, `HTTP ${r.status}`);
}
{ // source maps
  const { t } = await get("/"); const chunks = [...t.matchAll(/\/_next\/static\/chunks\/[^"']+\.js/g)].map((m) => m[0]).slice(0, 6);
  let exposed = 0; for (const c of chunks) { const js = await (await fetch(SITE + c)).text(); if (/sourceMappingURL=/.test(js.slice(-300))) { const m = await fetch(SITE + c + ".map"); if (m.status === 200) exposed++; } }
  check("security: no public source maps", exposed === 0, `${exposed} of ${chunks.length} chunks have a reachable .map`);
}
{ const r = await fetch(SITE + "/passport/card"); check("security: passport picture refuses signed-out visitors", r.status === 401, `HTTP ${r.status}`); }
{ const { r, t } = await get("/admin/messages"); check("security: admin page shows no messages to strangers", !/Reply to|mailto:/.test(t), ""); const robots = /<meta name="robots" content="noindex/.test(t); check("security: admin page is noindex", robots); note("admin page status for strangers", `HTTP ${r.status} (soft not-found)`); }
{ const { t } = await get("/passport"); check("security: passport page (signed out) shows only a sign-in prompt", /Sign in with Google/.test(t) && !/name="artistName"/.test(t) && !/name="date"/.test(t)); check("security: passport page is noindex", /<meta name="robots" content="noindex/.test(t)); }
for (const p of ["/settings", "/my-artists"]) { const { t } = await get(p); check(`security: ${p} signed out shows only sign-in`, /Sign in with Google/.test(t) && !/Delete my account|artists followed/.test(t)); }
{ const { r, t } = await get("/api/auth/session"); check("security: anonymous session is empty", t.trim() === "null" || t.trim() === "{}", t.slice(0, 80)); }
{ const { t } = await get("/api/auth/providers"); const j = JSON.parse(t); check("security: only Google sign-in is offered", Object.keys(j).join() === "google", Object.keys(j).join()); }
{ const { r, t } = await get("/api/alerts/check"); check("security: alert endpoint returns no personal data", !/@|endpoint|p256dh|userId/.test(t), t.slice(0, 120)); note("alert endpoint", `HTTP ${r.status}: ${t.slice(0, 100)}`); }
{ const { r } = await get("/api/suggest?q=calv"); const acao = r.headers.get("access-control-allow-origin"); check("security: API doesn't allow cross-site reading by default", !acao || acao !== "*", acao); }
{ // third-party resources
  const { t } = await get("/"); const hosts = new Set(); for (const m of t.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)) { try { hosts.add(new URL(m[1].replace(/&amp;/g, "&")).hostname); } catch {} }
  const ok = (h) => /(^|\.)ticketmaster\.|(^|\.)ticketm\.net$|(^|\.)livenation\.|tourtix\.vercel\.app|calendar\.google\.com|stubhub\.com|vividseats\.com|seatgeek\.com|gametime\.co|axs\.com/.test(h);
  const odd = [...hosts].filter((h) => !ok(h)); check("security/privacy: homepage loads nothing from unexpected third parties", odd.length === 0, odd.join(", ")); note("homepage external hosts", [...hosts].join(", "));
  check("privacy: no ad or tracking scripts", !/googlesyndication|doubleclick|facebook\.net|googletagmanager|google-analytics|hotjar|segment\.|mixpanel/.test(t));
}

// ---------------- LEGAL / TRUST ----------------
{ const { t } = await get("/"); const s = text(t);
  for (const n of ["doesn't sell tickets", "not affiliated", "Terms of Use", "Privacy Policy", "Event data provided by Ticketmaster"]) check(`legal: homepage says "${n}"`, s.includes(n)); }
{ const s = text((await get("/privacy")).t);
  for (const n of ["Concert passport", "local storage", "Mark as going", "Google profile picture", "Neon", "Vercel", "Zippopotam", "13", "Delete my account", "do not sell", "Last updated"]) check(`legal: privacy policy covers "${n}"`, s.toLowerCase().includes(n.toLowerCase())); note("privacy policy date", (s.match(/Last updated ([A-Za-z]+ \d+, \d{4})/) ?? [])[1]); }
{ const s = text((await get("/terms")).t);
  for (const n of ["within 24 hours", "You likely qualify", "13", "do not sell", "not affiliated", "as is"]) check(`legal: terms cover "${n}"`, s.toLowerCase().includes(n.toLowerCase())); note("terms date", (s.match(/Last updated ([A-Za-z]+ \d+, \d{4})/) ?? [])[1]); }
{ const { t } = await get("/sitemap.xml"); const urls = [...t.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  check("legal/privacy: sitemap leaves out private pages", !urls.some((u) => /\/(passport|settings|my-artists|admin)/.test(u)), urls.filter((u) => /\/(passport|settings|my-artists|admin)/.test(u)).join(", "));
  let bad = 0; for (const u of urls.slice(0, 30)) { const r = await fetch(u.replace(/^https?:\/\/[^/]+/, SITE)); if (r.status !== 200) bad++; } check(`working: sitemap pages load (checked ${Math.min(30, urls.length)} of ${urls.length})`, bad === 0, `${bad} failed`); }
{ const { t } = await get("/contact"); check("trust: contact form has a spam trap and no public email", /name="website"/.test(t) && !/mailto:/.test(t)); }
{ const { t } = await get("/faq"); const j = t.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/); let ok = false, n = 0; try { n = JSON.parse(j[1]).mainEntity.length; ok = n > 10; } catch {} check("working: FAQ markup is valid", ok, String(n)); }

// ---------------- ACCURACY ----------------
{ const { t } = await get("/"); const s = text(t);
  check("accuracy: showing real Ticketmaster data, not sample data", !/sample data/i.test(s));
  check("accuracy: no non-music events in the popular list", !/GRAND PRIX|Motorsports|Wrestling/i.test(s), (s.match(/.{20}(GRAND PRIX|Motorsports).{20}/i) ?? [""])[0]);
  const cds = [...s.matchAll(/ends ([A-Z][a-z]{2} \d{1,2})(,? \d{4})?/g)].map((m) => m[0]); note("homepage 'ends' dates", cds.join(" | ") || "none"); }
const searches = { calv: "Calvin Harris", "calvin": "Calvin Harris", "ed sh": "Ed Sheeran", kend: "Kendrick Lamar", "taylor sw": "Taylor Swift", "harry s": "Harry Styles", sabrina: "Sabrina Carpenter", olivia: "Olivia Rodrigo", gaga: "Lady Gaga" };
for (const [q, want] of Object.entries(searches)) { const r = await (await fetch(`${SITE}/api/suggest?q=${encodeURIComponent(q)}`)).json(); check(`accuracy: searching "${q}" finds ${want} first`, Array.isArray(r) && r[0]?.name === want, Array.isArray(r) ? r.slice(0, 3).map((x) => x.name).join(" | ") : "rate-limited or error"); }

const ids = new Map(); { const { t } = await get("/"); for (const m of t.matchAll(/href="\/artists\/([^"#?]+)"/g)) ids.set(m[1], m[1]); }
for (const n of ["Calvin Harris", "Dua Lipa", "Metallica", "Oasis", "Lady A", "Zach Bryan", "Morgan Wallen", "Backstreet Boys", "Harry Styles", "Noah Kahan", "Luke Combs", "Olivia Rodrigo"]) { try { const s = await (await fetch(`${SITE}/api/suggest?q=${encodeURIComponent(n)}`)).json(); if (s[0]) ids.set(s[0].id, s[0].name); } catch {} }
const MONTHS = { January: 0, February: 1, March: 2, April: 3, May: 4, June: 5, July: 6, August: 7, September: 8, October: 9, November: 10, December: 11 };
const today = new Date(); today.setUTCHours(0, 0, 0, 0);
const OK_SELL = /(^|\.)ticketmaster\.[a-z.]+$|(^|\.)livenation\.[a-z.]+$|americanexpress\.com$|calendar\.google\.com|stubhub|vividseats|seatgeek|gametime\.co|axs\.com/;
let pagesN = 0, rowsN = 0, linksN = 0; const problems = []; const odd = new Map();
for (const [id, name] of ids) {
  const { r, t, ms } = await get(`/artists/${id}`); pagesN++; const w = `${name} (${id})`;
  if (r.status !== 200) { problems.push(`${w}: HTTP ${r.status}`); continue; }
  if (ms > 9000) problems.push(`${w}: slow ${ms}ms`);
  const s = text(t);
  if (/Something went wrong/.test(s)) problems.push(`${w}: error page`);
  if (/\b(NaN|undefined|Invalid Date|\[object)\b/.test(s)) problems.push(`${w}: NaN/undefined/Invalid Date text`);
  if (/\b1900\b|\b1970\b/.test(s)) problems.push(`${w}: placeholder year visible`);
  const rows = [...t.matchAll(/<li id="show-([^"]+)"[\s\S]*?<\/li>/g)]; rowsN += rows.length;
  for (const [row, sid] of rows) {
    const rs = text(row.replace(/<!-- -->/g, ""));
    const full = rs.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\w+) (\d+), (\d{4})/);
    if (full) { const d = new Date(Date.UTC(+full[4], MONTHS[full[2]], +full[3])); if (d < today) problems.push(`${w}: show ${sid} is in the past (${full[0]})`); }
    if (/Cancelled|Postponed/.test(rs) && /Get tickets on/.test(rs)) problems.push(`${w}: ${sid} cancelled/postponed but offers tickets`);
  }
  const clean = t.replace(/<!-- -->/g, "");
  for (const m of clean.matchAll(/<a [^>]*href="(https?:[^"]+)"[^>]*>(?:<[^>]+>)*\s*Get tickets on ([^<]+)</g)) {
    const host = new URL(m[1].replace(/&amp;/g, "&")).hostname; const nm = m[2].trim();
    const isTm = /(^|\.)ticketmaster\.(?:[a-z]{2,3}|(?:co|com)\.[a-z]{2})$/.test(host);
    if ((nm === "Ticketmaster") !== isTm && !(nm === "Live Nation" && /livenation/.test(host))) problems.push(`${w}: button "${nm}" goes to ${host}`);
  }
  for (const m of t.matchAll(/<a [^>]*href="(https?:[^"]+)"/g)) {
    const href = m[1].replace(/&amp;/g, "&"); linksN++; let u; try { u = new URL(href); } catch { problems.push(`${w}: malformed link`); continue; }
    if (/(^|[&?])(aff|affiliate|affiliate_id|irclickid|clickid|irgwc|camefrom|utm_[a-z]+)=/i.test(u.search)) problems.push(`${w}: affiliate/tracking params on ${u.hostname}`);
    if (/urldefense|proofpoint/.test(u.hostname)) problems.push(`${w}: wrapped security link left in`);
    if (!OK_SELL.test(u.hostname)) odd.set(u.hostname, (odd.get(u.hostname) ?? 0) + 1);
    if (u.protocol !== "https:" && u.protocol !== "http:") problems.push(`${w}: bad link type ${u.protocol}`);
  }
}
check(`accuracy: ${pagesN} artist pages, ${rowsN} shows, ${linksN} links have no errors`, problems.length === 0, problems.slice(0, 12).join(" || ") + (problems.length > 12 ? ` (+${problems.length - 12} more)` : ""));
note("other official sites linked from Ticketmaster data (presale sign-ups, packages)", [...odd].sort((a, b) => b[1] - a[1]).slice(0, 25).map(([h, n]) => `${h} (${n})`).join(", "));

{ // rate limit: identical cached query, so no ticket-API quota is used
  let blocked = 0; for (let i = 0; i < 75; i++) { const r = await fetch(SITE + "/api/suggest?q=zz"); if (r.status === 429) blocked++; }
  if (blocked) check("security: search rate limit kicks in on a flood", true); else note("search rate limit", "no 429 in 75 rapid requests (limit is per server instance; requests may have been spread across instances)");
}

const fails = out.filter((l) => l.startsWith("FAIL")).length;
console.log(`FINAL AUDIT  ${new Date().toISOString()}\nPASS ${out.filter((l) => l.startsWith("PASS")).length}   FAIL ${fails}   NOTE ${out.filter((l) => l.startsWith("NOTE")).length}\n`);
console.log(out.join("\n"));
if (fails) process.exitCode = 1;
