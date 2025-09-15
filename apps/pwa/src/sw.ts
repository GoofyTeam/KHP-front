import { precacheAndRoute, cleanupOutdatedCaches } from "workbox-precaching";
import { clientsClaim, skipWaiting } from "workbox-core";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst, NetworkOnly, StaleWhileRevalidate } from "workbox-strategies";
import { BackgroundSyncPlugin } from "workbox-background-sync";
import { Route } from "workbox-routing";

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

// Queue write endpoints when offline and replay later
registerRoute(
  /\/api\/(ingredients|preparations)\/[^/]+\/(add-quantity|remove-quantity|move-quantity)$/,
  new NetworkOnly({ plugins: [bgSyncPlugin] }),
  "POST"
);

// Runtime cache for API GETs with stale-while-revalidate
registerRoute(
  ({ request, url }) => request.method === "GET" && url.pathname.startsWith("/api/"),
  new StaleWhileRevalidate({
    cacheName: "api-get-cache",
  })
);

registerRoute(
  ({ url }) => url.pathname.endsWith("sql-wasm.wasm"),
  new CacheFirst({
    cacheName: "sql-wasm-cache",
  })
);

// Cache GraphQL POST responses to allow offline read of previously seen data
// Cache key = URL + body content
const graphqlCacheName = "graphql-post-cache";
const graphqlRoute = new Route(
  ({ url, request }) => request.method === "POST" && url.pathname.endsWith("/graphql"),
  async ({ event }) => {
    const req = event.request;
    const cache = await caches.open(graphqlCacheName);
    const body = await req.clone().text().catch(() => "");
    const keyUrl = new URL(req.url);
    keyUrl.searchParams.set("_body", body);
    const cacheKey = new Request(keyUrl.toString(), { method: "GET" });

    try {
      const networkResp = await fetch(req.clone());
      if (networkResp && networkResp.ok) {
        // store successful responses
        event.waitUntil(cache.put(cacheKey, networkResp.clone()));
      }
      return networkResp;
    } catch (e) {
      // offline: try cache
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
      throw e;
    }
  }
);

registerRoute(graphqlRoute);
