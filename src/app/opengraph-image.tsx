import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "TourTix: never miss a ticket drop";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          gap: 24,
          background: "linear-gradient(135deg, #7c3aed, #d946ef)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 110, fontWeight: 800 }}>TourTix</div>
        <div style={{ fontSize: 48 }}>Never miss a ticket drop</div>
        <div style={{ fontSize: 34, opacity: 0.85 }}>
          Track artists&apos; tours · presale alerts · where to buy
        </div>
      </div>
    ),
    size,
  );
}
