import { createFileRoute } from "@tanstack/react-router";
import HandleItem from "../../pages/HandleItem";
import { graphqlRequest } from "../../lib/graph-client";
import {
  GetLocations,
  type GetLocationsQuery,
} from "../../graphql/getLocations.gql";
import {
  GetCategories,
  type GetCategoriesQuery,
} from "../../graphql/getCategories.gql";

import handleScanType from "../../lib/handleScanType";

export type handleItemSearch = {
  type: "add" | "remove" | "update";
  mode: "barcode" | "internalId" | "manual";
  barcode?: string;
  internalId?: string;
};

export const Route = createFileRoute("/_protected/handle-item")({
  validateSearch: (search: Record<string, unknown>): handleItemSearch => {
    return {
      mode: (search.mode as handleItemSearch["mode"]) ?? "manual",
      type: (search.type as handleItemSearch["type"]) ?? "add",
      barcode: (search.barcode as string) ?? undefined,
      internalId: (search.internalId as string) ?? undefined,
    };
  },
  loaderDeps: ({ search }) => ({
    mode: search.mode,
    type: search.type,
    barcode: search.barcode,
    internalId: search.internalId,
  }),
  beforeLoad: async ({ search }) => {
    if (search.mode === "barcode" && !search.barcode) {
      throw new Error("Barcode is required for barcode mode");
    }

    if (search.mode === "internalId" && !search.internalId) {
      throw new Error("Product ID is required for update mode");
    }
  },
  loader: async ({ deps: { mode, type, barcode, internalId } }) => {
    const locationQuery = await graphqlRequest<GetLocationsQuery>(GetLocations);
    const availableLocations = locationQuery.locations.data || [];
    const categoriesQuery =
      await graphqlRequest<GetCategoriesQuery>(GetCategories);
    const categories = categoriesQuery.categories.data || [];

    const productToFetch = internalId ?? barcode;
    if (!productToFetch && mode !== "manual")
      throw new Error("Product identifier is required");

    const productData = await handleScanType(mode, productToFetch);

    return {
      availableLocations,
      categories,
      product: productData,
      type,
      productId: productToFetch,
    };
  },
  component: HandleItem,
});
