import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getArtist, getShows } from "@/lib/data";
import { fmtDate } from "@/lib/format";

// The preview card shown when an artist page is shared in texts and social apps.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "TourTix artist tour dates";

// Bundled with the app: Inter (SIL Open Font License, see src/assets) and the
// sunset glow pre-rendered as an image, since the image renderer can't blur.
const asset = (name: string) => readFile(join(process.cwd(), "src/assets", name));

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = await getArtist(id).catch(() => null);
  const shows = artist ? await getShows(artist).catch(() => []) : [];
  const upcoming = shows.filter((s) => s.status !== "cancelled");
  const next = upcoming[0];
  const place = next ? [next.city, next.region ?? next.country].filter(Boolean).join(", ") : "";
  const [bold, regular, glow] = await Promise.all([
    asset("Inter-ExtraBold.otf"),
    asset("Inter-Regular.otf"),
    asset("og-glow.jpg"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          alignItems: "center",
          gap: 56,
          padding: 72,
          background: "#0e0e11",
          color: "#f4f4f6",
          fontFamily: "Inter",
        }}
      >
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img
          src={`data:image/jpeg;base64,${glow.toString("base64")}`}
          width={1200}
          height={630}
          style={{ position: "absolute", left: 0, top: 0 }}
        />
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 22 }}>
          <div style={{ display: "flex", fontSize: 40, fontWeight: 800 }}>
            <span>Tour</span>
            <span style={{ color: "#ff7a4d" }}>Tix</span>
          </div>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.04, letterSpacing: -3 }}>
            {artist?.name ?? "Tour dates"}
          </div>
          <div style={{ fontSize: 36, color: "#a1a1ad" }}>
            {next
              ? `Next show: ${fmtDate(next.date)}${place ? ` · ${place}` : ""}`
              : "Tour dates & ticket drops"}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
            {upcoming.length > 0 && (
              <div
                style={{
                  display: "flex",
                  padding: "10px 22px",
                  borderRadius: 999,
                  background: "#ff7a4d",
                  color: "#160b06",
                  fontSize: 26,
                  fontWeight: 800,
                }}
              >
                {`${upcoming.length} upcoming ${upcoming.length === 1 ? "show" : "shows"}`}
              </div>
            )}
            <div
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                background: "#232329",
                fontSize: 26,
              }}
            >
              Presale alerts · free
            </div>
          </div>
        </div>
        {artist?.imageUrl && (
          // eslint-disable-next-line jsx-a11y/alt-text
          <img
            src={artist.imageUrl}
            width={400}
            height={400}
            style={{ width: 400, height: 400, borderRadius: 40, objectFit: "cover" }}
          />
        )}
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: bold, weight: 800, style: "normal" },
        { name: "Inter", data: regular, weight: 400, style: "normal" },
      ],
    },
  );
}
