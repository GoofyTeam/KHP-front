import { createFileRoute } from "@tanstack/react-router";
import InventoryPage from "../../pages/Inventory";
import { graphqlRequest } from "../../lib/graph-client";
import {
  GetCompanyProducts,
  type GetCompanyProductsQuery,
} from "../../graphql/getCompanyProducts.gql";
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

    const result = await graphqlRequest<GetCompanyProductsQuery>(
      GetCompanyProducts,
      variables,
    );

    return {
      data: result.ingredients.data ?? [],
      pageInfo: result.ingredients.paginatorInfo,
    };
  },
  component: InventoryPage,
});
