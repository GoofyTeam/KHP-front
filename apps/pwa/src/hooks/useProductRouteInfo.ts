import { useMatch } from "@tanstack/react-router";

export interface ProductRouteInfo {
  id: string | null;
  isHistoryRoute: boolean;
  isProductRoute: boolean;
}

export function useProductRouteInfo(): ProductRouteInfo {
  const productMatch = useMatch({
    from: "/_protected/products/$id",
    shouldThrow: false,
  });

  const historyMatch = useMatch({
    from: "/_protected/products/$id_/history",
    shouldThrow: false,
  });

  const id = productMatch?.params?.id || historyMatch?.params?.id || null;
  const isHistoryRoute = Boolean(historyMatch);
  const isProductRoute = Boolean(id);

  return {
    id,
    isHistoryRoute,
    isProductRoute,
  };
}
