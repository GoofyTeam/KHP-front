"use client";

import { useUserStore } from "@/stores/user-store";
import { useStocksStore } from "@/stores/stocks-store";
import { useOrdersStore } from "@/stores/orders-store";
import { httpClient } from "@/lib/httpClient";
import { ApolloClient } from "@apollo/client";

export async function performCompleteLogout(
  apolloClient: ApolloClient<unknown>
) {
  try {
    await httpClient.post("/api/logout");
  } catch {}

  useUserStore.getState().clearUser();
  useStocksStore.getState().resetFilters();
  useOrdersStore.getState().resetFilters();

  ["XSRF-TOKEN", "khp_session", "laravel_session"].forEach((name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  });

  await apolloClient.resetStore();
  apolloClient.cache.evict({ id: "ROOT_QUERY" });
  apolloClient.cache.gc();

  localStorage.clear();
  sessionStorage.clear();
}
