import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { passportStats, stampDate, type Stamp } from "./passport";

// The picture behind "Share my passport". It's built on request from the
// signed-in user's own stamps and is never stored or given a public link.
// Only what the user ticks (dates, cities, a first name) appears on it.

export const CARD_SIZE = { width: 1080, height: 1350 };
const MAX_ROWS = 8;

const asset = (name: string) => readFile(join(process.cwd(), "src/assets", name));
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s);

export type CardOptions = { showDates: boolean; showCities: boolean; name: string | null };

export async function passportCard(stamps: Stamp[], opts: CardOptions) {
  const [bold, regular, glow] = await Promise.all([
    asset("Inter-ExtraBold.otf"),
    asset("Inter-Regular.otf"),
    asset("passport-glow.jpg"),
  ]);
  const stats = passportStats(stamps);
  const rows = stamps.slice(0, MAX_ROWS);
  const more = stamps.length - rows.length;
  const facts = [
    `${stats.artists} ${stats.artists === 1 ? "artist" : "artists"}`,
    opts.showCities && stats.cities > 0 ? `${stats.cities} ${stats.cities === 1 ? "city" : "cities"}` : null,
    opts.showDates && stats.firstYear ? (stats.firstYear === stats.lastYear ? `${stats.firstYear}` : `${stats.firstYear}–${stats.lastYear}`) : null,
  ].filter(Boolean);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          padding: "84px 80px",
          background: "#0e0e11",
          color: "#f4f4f6",
          fontFamily: "Inter",
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element */}
        <img
          src={`data:image/jpeg;base64,${glow.toString("base64")}`}
          width={CARD_SIZE.width}
          height={CARD_SIZE.height}
          style={{ position: "absolute", left: 0, top: 0 }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", fontSize: 44, fontWeight: 800 }}>
            <span>Tour</span>
            <span style={{ color: "#ff7a4d" }}>Tix</span>
          </div>
          <div
            style={{
              display: "flex",
              border: "3px solid #ff9a76",
              color: "#ff9a76",
              borderRadius: 16,
              padding: "6px 18px",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: 3,
              transform: "rotate(-6deg)",
            }}
          >
            CONCERT PASSPORT
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 56 }}>
          {opts.name && <div style={{ fontSize: 40, color: "#a1a1ad" }}>{`${clip(opts.name, 20)}'s passport`}</div>}
          <div style={{ display: "flex", alignItems: "baseline", gap: 22 }}>
            <div style={{ fontSize: 190, fontWeight: 800, lineHeight: 1, letterSpacing: -6 }}>{String(stats.concerts)}</div>
            <div style={{ fontSize: 56, fontWeight: 800, color: "#ff7a4d" }}>{stats.concerts === 1 ? "concert" : "concerts"}</div>
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#a1a1ad", marginTop: 6 }}>{facts.join("  ·  ")}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 44, flex: 1 }}>
          {rows.map((s) => (
            <div
              key={s.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "17px 0",
                borderTop: "2px solid #26262d",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 38, fontWeight: 800 }}>{clip(s.artistName, 26)}</div>
                {opts.showCities && s.city && <div style={{ fontSize: 26, color: "#a1a1ad" }}>{clip(s.city, 30)}</div>}
              </div>
              {opts.showDates && <div style={{ fontSize: 30, color: "#a1a1ad" }}>{stampDate(s.eventDate)}</div>}
            </div>
          ))}
          {more > 0 && (
            <div style={{ display: "flex", fontSize: 28, color: "#a1a1ad", paddingTop: 12 }}>{`+ ${more} more`}</div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28, color: "#8a8a96" }}>
          <div>tourtix.vercel.app</div>
          <div>Free · no ads</div>
        </div>
      </div>
    ),
    {
      ...CARD_SIZE,
      fonts: [
        { name: "Inter", data: bold, weight: 800, style: "normal" },
        { name: "Inter", data: regular, weight: 400, style: "normal" },
      ],
    },
  );
}
