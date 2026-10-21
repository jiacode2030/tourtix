import type { MetadataRoute } from "next";

// Lets people add TourTix to their home screen, which iPhones require
// before a website can send notifications.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TourTix",
    short_name: "TourTix",
    description: "Track your favorite artists' tours and get alerts when tickets go on sale.",
    start_url: "/my-artists",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7c3aed",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
