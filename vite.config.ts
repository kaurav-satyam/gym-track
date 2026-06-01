import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const themeColor = "#050816";

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      strategies: "generateSW",
      injectRegister: "auto",
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.png",
        "logo.svg",
        "apple-touch-icon.png",
        "screenshots/*.png",
      ],
      workbox: {
        cleanupOutdatedCaches: true,
        navigateFallback: "index.html",
      },
      devOptions: {
        enabled: true,
        suppressWarnings: true,
        navigateFallbackAllowlist: [/^\/$/],
      },
      manifest: {
        id: "/",
        name: "GymTrack",
        short_name: "GymTrack",
        description: "This app is for tracking and recording your gym workouts.",
        start_url: "/",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        theme_color: themeColor,
        background_color: themeColor,
        lang: "en",
        categories: ["health", "fitness", "sports"],
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshots/install-home-narrow.png",
            sizes: "1080x1920",
            type: "image/png",
            form_factor: "narrow",
            label: "Weekly split screen showing workout days, durations, and completion progress.",
          },
          {
            src: "/screenshots/install-session-narrow.png",
            sizes: "1080x1920",
            type: "image/png",
            form_factor: "narrow",
            label: "Session planner screen showing exercises, set inputs, and completion actions.",
          },
          {
            src: "/screenshots/install-overview-wide.png",
            sizes: "1600x900",
            type: "image/png",
            form_factor: "wide",
            label: "Desktop overview showing the weekly plan, active session, and exercise history.",
          },
        ],
      },
    }),
  ],
});
