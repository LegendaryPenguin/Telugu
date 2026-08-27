import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// Dev proxy: the browser calls /api/* and Vite forwards to the local server
// that holds the LLM key. In production the same paths are served by the server.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      // Precache the app shell, fonts, AND the bundled phrase audio so daily
      // sessions work fully offline — the whole point of a habit app on a phone.
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff,woff2}", "audio/**/*.{mp3,json}"],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true
      },
      manifest: {
        name: "Telugu — Speak Telangana",
        short_name: "Telugu",
        description: "Learn to speak and understand Telangana Telugu.",
        start_url: "/",
        display: "standalone",
        theme_color: "#0f766e",
        background_color: "#0b1120",
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:8787"
    }
  }
});
