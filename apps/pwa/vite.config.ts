import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import graphqlLoader from "vite-plugin-graphql-loader";

export default defineConfig({
  server: {
    allowedHosts: process.env.ALLOWED_HOSTS
      ? process.env.ALLOWED_HOSTS.split(",")
      : [],
  },
  optimizeDeps: {
    exclude: ["@preflower/barcode-detector-polyfill"],
  },
  plugins: [
    graphqlLoader(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
    VitePWA({
      srcDir: "src",
      filename: "sw.ts",
      strategies: "injectManifest",
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.ico",
        "robots.txt",
        "apple-touch-icon-180x180.png",
        "maskable-icon-512x512.png",
        "pwa-64x64.png",
        "pwa-192x192.png",
        "pwa-512x512.png",
      ],
      manifest: {
        name: "KHP – Kitchen Helper",
        short_name: "KHP",
        id: "/",
        description: "Food management SaaS for the restaurant industry",
        theme_color: "#4caf50",
        background_color: "#fcfffc",
        display: "standalone",
        scope: "/",
        start_url: "/login",
        dir: "ltr",
        orientation: "portrait-primary",
        prefer_related_applications: false,
        launch_handler: {
          client_mode: ["navigate-existing", "auto"],
        },
        categories: ["business", "productivity", "food-and-drink"],
        scope_extensions: [
          {
            origin: "https://*.stroyco.eu",
          },
        ],
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "/screenshots/big-screen.png",
            sizes: "1280x720",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "/screenshots/big-screen.png",
            sizes: "360x640",
            type: "image/png",
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
      pwaAssets: {
        config: true,
      },
    }),
  ],
});
