import { createFileRoute } from "@tanstack/react-router";
import HandleItem from "../../pages/HandleItem";
import { graphqlRequest } from "../../lib/graph-client";
import {
  GetLocations,
  GetLocationsQuery,
} from "../../graphql/getLocations.gql";
import {
  GetItemResult,
  GetItemResultQuery,
} from "../../graphql/getItemResult.gql";
import {
  GetCategories,
  GetCategoriesQuery,
} from "../../graphql/getCategories.gql";

type handleItemSearch = {
  mode: "scan" | "manual" | "db" | "update";
  type: "add" | "remove";
  barcode?: string;
};

export const Route = createFileRoute("/_protected/handle-item")({
  validateSearch: (search: Record<string, unknown>): handleItemSearch => {
    return {
      mode: (search.mode as handleItemSearch["mode"]) ?? "manual",
      type: (search.type as handleItemSearch["type"]) ?? "add",
      barcode: (search.barcode as string) ?? undefined,
    };
  },
  loaderDeps: ({ search }) => ({
    mode: search.mode,
    type: search.type,
    barcode: search.barcode,
  }),
  beforeLoad: async ({ search }) => {
    if (search.mode === "scan" && !search.barcode) {
      throw new Error("Barcode is required for scan mode");
    }
  },
  loader: async ({ deps: { mode, type, barcode } }) => {
    const locationQuery = await graphqlRequest<GetLocationsQuery>(GetLocations);
    const availableLocations = locationQuery.locations.data || [];
    const categoriesQuery =
      await graphqlRequest<GetCategoriesQuery>(GetCategories);
    const categories = categoriesQuery.categories.data || [];

    if (mode === "scan") {
      if (!barcode) {
        //Redirect to scan with error
        throw new Error("Barcode is required for scan mode");
      }
      const variables = {
        barcode,
        page: 1,
      };

      const result = await graphqlRequest<GetItemResultQuery>(
        GetItemResult,
        variables
      );


      return {
        mode,
        type,
        barcode,
        product: result.search,
        availableLocations,
        categories,
      };
    } else if (mode === "update") {
      // Handle fetching by product ID for update
    } else if (mode === "db") {
      // Handle fetching by product ID from the database
    }

    return {
      mode,
      type,
      barcode: undefined,
      product: null,
      availableLocations,
    };
  },
  component: HandleItem,
});
