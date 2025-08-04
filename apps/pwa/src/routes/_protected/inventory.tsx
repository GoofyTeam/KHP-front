import { createFileRoute } from "@tanstack/react-router";
import InventoryPage from "../../pages/Inventory";
import { graphqlRequest } from "../../lib/graph-client";
import {
  GetCompanyProducts,
  GetCompanyProductsQuery,
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
    let options = {};

    if (search_terms && search_terms.trim() !== "") {
      options = {
        ...options,
        name: search_terms.trim(),
      };
    }

    if (pageIndex < 1) {
      options = {
        ...options,
        page: 1,
      };
    } else {
      options = {
        ...options,
        page: pageIndex,
      };
    }

    return await graphqlRequest<GetCompanyProductsQuery>(
      GetCompanyProducts,
      options
    );
  },
  component: InventoryPage,
});
