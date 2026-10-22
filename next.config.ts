import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The share images read their font and background from disk.
  outputFileTracingIncludes: {
    "/artists/[id]/opengraph-image": ["./src/assets/**"],
    "/passport/card": ["./src/assets/**"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Nothing should show TourTix inside another site's frame.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Location is only used when someone taps "Use my current location".
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
