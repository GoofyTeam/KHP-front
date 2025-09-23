/// <reference lib="webworker" />

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

const mutationSyncPlugin = new BackgroundSyncPlugin("mutationQueue", {
  maxRetentionTime: 24 * 60, // retry for 24h
});

const mutationMatcher = ({ url, request }: { url: URL; request: Request }) => {
  if (request.method === "GET") return false;
  const sameOrigin = url.origin === self.location.origin;
  const isApiCall = url.pathname.startsWith("/api/");
  const isGraphQL = url.pathname === "/graphql";
  return sameOrigin && (isApiCall || isGraphQL);
};

const mutationMethods = [
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
] as const;

mutationMethods.forEach((method) => {
  registerRoute(
    mutationMatcher,
    new NetworkOnly({ plugins: [mutationSyncPlugin] }),
    method
  );
});

registerRoute(
  ({ url }) => url.pathname.endsWith("sql-wasm.wasm"),
  new CacheFirst({
    cacheName: "sql-wasm-cache",
  })
);
