import { createFileRoute } from "@tanstack/react-router";
import ProductPage from "../../pages/Product";
import { graphqlRequestWithOffline } from "../../lib/offline-graphql";
import { GetProductDocument, type GetProductQuery } from "@workspace/graphql";
import { mapIngredientToWantedData } from "../../lib/handleScanType";
import { saveIngredientSnapshot } from "../../lib/ingredient-cache";

export const Route = createFileRoute("/_protected/products/$id")({
  loader: async ({ params }) => {
    let result: GetProductQuery | null = null;
    let source: "network" | "cache" = "network";
    let timestamp = Date.now();
    let offlineMiss = false;

    try {
      const response = await graphqlRequestWithOffline<GetProductQuery>(
        GetProductDocument,
        {
          id: params.id,
        }
      );
      result = response.data;
      source = response.source;
      timestamp = response.timestamp;
    } catch (error) {
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      if (!isOffline) {
        throw error;
      }
      offlineMiss = true;
    }

    if (!result?.ingredient) {
      if (offlineMiss) {
        return {
          data: null,
          meta: {
            id: params.id,
            loadedAt: null,
            source: "missing-offline" as const,
            cacheTimestamp: null,
          },
        };
      }
      throw new Error(`Product with ID ${params.id} not found`);
    }

    const normalized = mapIngredientToWantedData(result.ingredient);
    await saveIngredientSnapshot(normalized);

    return {
      data: result.ingredient,
      meta: {
        id: params.id,
        loadedAt: new Date(timestamp).toISOString(),
        source,
        cacheTimestamp: timestamp,
      },
    };
  },
  component: ProductPage,
});
