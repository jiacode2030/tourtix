import { ImageResponse } from "next/og";
import { getArtist, getShows } from "@/lib/data";
import { fmtDate } from "@/lib/format";

// The preview card shown when an artist page is shared in texts and social apps.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "TourTix artist tour dates";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artist = await getArtist(id).catch(() => null);
  const shows = artist ? await getShows(artist).catch(() => []) : [];
  const upcoming = shows.filter((s) => s.status !== "cancelled");
  const next = upcoming[0];
  const place = next ? [next.city, next.region ?? next.country].filter(Boolean).join(", ") : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #7c3aed, #d946ef)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 700, opacity: 0.9 }}>TourTix</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 88, fontWeight: 800, lineHeight: 1.05 }}>
            {artist?.name ?? "Tour dates"}
          </div>
          <div style={{ fontSize: 40, opacity: 0.95 }}>
            {next
              ? `Next show: ${fmtDate(next.date)}${place ? ` · ${place}` : ""}`
              : "Tour dates & ticket drops"}
          </div>
          {upcoming.length > 1 && (
            <div style={{ fontSize: 32, opacity: 0.85 }}>{`${upcoming.length} upcoming shows`}</div>
          )}
        </div>
        <div style={{ fontSize: 30, opacity: 0.85 }}>Never miss a ticket drop</div>
      </div>
    ),
    size,
  );
}
