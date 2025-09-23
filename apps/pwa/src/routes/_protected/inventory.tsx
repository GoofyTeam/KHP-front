import { createFileRoute } from "@tanstack/react-router";
import InventoryPage from "../../pages/Inventory";
import { graphqlRequestWithOffline } from "../../lib/offline-graphql";
import {
  GetCompanyProductsDocument,
  type GetCompanyProductsQuery,
} from "@workspace/graphql";
import z from "zod";

export const Route = createFileRoute("/_protected/inventory")({
  validateSearch: z.object({
    search_terms: z.string().optional(),
    pageIndex: z.number().default(1),
  }),
  loaderDeps: ({ search }) => ({
    search_terms: search.search_terms,
    pageIndex: search.pageIndex,
  }),
  loader: async ({ deps: { search_terms, pageIndex } }) => {
    const variables: Record<string, unknown> = {
      page: pageIndex,
    };
    if (search_terms?.trim()) {
      variables.searchQuery = search_terms.trim();
    }

    try {
      const { data: result, source, timestamp } =
        await graphqlRequestWithOffline<GetCompanyProductsQuery>(
          GetCompanyProductsDocument,
          variables
        );

      return {
        data: result.ingredients.data ?? [],
        pageInfo: result.ingredients.paginatorInfo,
        source,
        cacheTimestamp: timestamp,
        status: "ok" as const,
      };
    } catch (error) {
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      if (!isOffline) {
        throw error;
      }

      const fallbackPageInfo = {
        hasMorePages: false,
        currentPage: pageIndex,
        lastPage: pageIndex,
        total: 0,
        count: 0,
        perPage: 0,
      } as GetCompanyProductsQuery["ingredients"]["paginatorInfo"];

      return {
        data: [] as GetCompanyProductsQuery["ingredients"]["data"],
        pageInfo: fallbackPageInfo,
        source: "missing-offline" as const,
        cacheTimestamp: null,
        status: "missing-offline" as const,
      };
    }
  },
  component: InventoryPage,
});
