import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "connectiv",
    short_name: "connectiv",
    description:
      "Rețeaua video-first pentru oamenii din Cluj-Napoca, București, Timișoara și Craiova care construiesc ceva.",
    start_url: "/feed",
    scope: "/",
    display: "standalone",
    background_color: "#111318",
    theme_color: "#111318",
    orientation: "portrait",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icons/icon-maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
