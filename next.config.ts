import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The artist share image reads its font and background from disk.
  outputFileTracingIncludes: {
    "/artists/[id]/opengraph-image": ["./src/assets/**"],
  },
};

export default nextConfig;
