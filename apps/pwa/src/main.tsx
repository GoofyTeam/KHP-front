import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { HelmetProvider } from "react-helmet-async";

import { routeTree } from "./routeTree.gen";
import "@workspace/ui/globals.css";
import { Guard } from "./components/guard-device";
import PWABadge from "./PWABadge";
import MobileInstallBanner from "./components/MobileInstallBanner";
import api from "./lib/api";
import { initializeOfflineStatusListeners } from "./lib/offline-status";

if (typeof navigator === "undefined" || navigator.onLine) {
  void api.flushOfflineQueue().catch((error) => {
    console.error("Failed to flush offline queue on startup", error);
  });
}

initializeOfflineStatusListeners(api.getBaseUrl());

export const router = createRouter({ routeTree });
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  const isProd = import.meta.env.PROD;

  root.render(
    <StrictMode>
      <HelmetProvider>
        <Guard isProd={isProd}>
          <RouterProvider router={router} />
          <PWABadge />
          <MobileInstallBanner />
        </Guard>
      </HelmetProvider>
    </StrictMode>
  );
}
