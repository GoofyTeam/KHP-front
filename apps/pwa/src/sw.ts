import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { clientsClaim, skipWaiting } from "workbox-core";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst, NetworkOnly } from "workbox-strategies";
import { BackgroundSyncPlugin } from "workbox-background-sync";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<{
    url: string;
    revision: string | null;
  }>;
};

skipWaiting();
clientsClaim();

cleanupOutdatedCaches();

precacheAndRoute(self.__WB_MANIFEST);

registerRoute(
  ({ request }) =>
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image",
  new CacheFirst({
    cacheName: "static-resources",
  })
);

registerRoute(
  ({ request }) => request.mode === "navigate",
  new NetworkFirst({
    cacheName: "pages",
  })
);

const bgSyncPlugin = new BackgroundSyncPlugin("apiQueue", {
  maxRetentionTime: 24 * 60, // réessaie pendant 24h
});

registerRoute(
  /\/api\/sync/,
  new NetworkOnly({ plugins: [bgSyncPlugin] }),
  "POST"
);

registerRoute(
  ({ url }) => url.pathname.endsWith("sql-wasm.wasm"),
  new CacheFirst({
    cacheName: "sql-wasm-cache",
  })
);
