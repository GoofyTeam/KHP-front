import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { HelmetProvider } from "react-helmet-async";

import { routeTree } from "./routeTree.gen";
import "@workspace/ui/globals.css";
import { Guard } from "./components/guard-device";
import PWABadge from "./PWABadge";
import MobileInstallBanner from "./components/MobileInstallBanner";
import OfflineBanner from "./components/OfflineBanner";
import SyncIndicator from "./components/SyncIndicator";
import { useOfflineQueue } from "./stores/offline-queue";

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
          <OfflineBanner />
          <SyncIndicator />
        </Guard>
      </HelmetProvider>
    </StrictMode>
  );
}

// Initialize offline queue namespace early
try {
  const ns = location.origin; // can be refined when user/tenant is available
  useOfflineQueue.getState().setNamespace(ns);
} catch {}
