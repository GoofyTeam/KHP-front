import { createFileRoute, redirect } from "@tanstack/react-router";
import HandleItem from "../../pages/handleItem/HandleItem";
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
import z from "zod";
import { handleTypes } from "./scan.$scanType";
import { scanModeEnum } from "../../pages/Scan";
import { useHandleItemStore } from "../../stores/handleitem-store";

export const handleItemSearchSchema = z.object({
  type: handleTypes,
  mode: z.enum(["barcode", "internalId", "manual", "search"]),
  scanMode: scanModeEnum,
  barcode: z.string().optional(),
  internalId: z.string().optional(),
});

// Type inféré automatiquement à partir du schema Zod
export type HandleItemSearch = z.infer<typeof handleItemSearchSchema>;

export const Route = createFileRoute("/_protected/handle-item")({
  validateSearch: (search: Record<string, unknown>): HandleItemSearch => {
    return {
      mode: (search.mode as HandleItemSearch["mode"]) ?? "manual",
      type: (search.type as HandleItemSearch["type"]) ?? "add",
      scanMode: search.scanMode as HandleItemSearch["scanMode"],
      barcode: (search.barcode as string) ?? undefined,
      internalId: (search.internalId as string) ?? undefined,
    };
  },
  loaderDeps: ({ search }) => ({
    mode: search.mode,
    type: search.type,
    scanMode: search.scanMode,
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
  loader: async ({ deps: { mode, type, barcode, internalId, scanMode } }) => {
    const locationQuery = await graphqlRequest<GetLocationsQuery>(GetLocations);
    const availableLocations = locationQuery.locations.data || [];
    const categoriesQuery =
      await graphqlRequest<GetCategoriesQuery>(GetCategories);
    const categories = categoriesQuery.categories.data || [];

    const productToFetch = internalId ?? barcode;
    if (!productToFetch && mode !== "manual")
      throw new Error("Product identifier is required");

    const productData = await handleScanType(mode, productToFetch);

    if (scanMode === "search-mode" && productData.product_already_in_database) {
      redirect({
        to: "/products/$id",
        params: {
          id: productData.product_internal_id!,
        },
        replace: true,
        throw: true,
      });
    }

    type =
      productData.product_already_in_database && type === "add-product"
        ? "add-quantity"
        : type;

    let pageTitle = "Manage your item";
    if (type === "add-product") {
      pageTitle = "Add a new product";
    } else if (type === "add-quantity") {
      pageTitle = "Add quantity to your product";
    } else if (type === "remove-quantity") {
      pageTitle = "Remove quantity from your product";
    } else if (type === "remove-product") {
      pageTitle = "Remove your product";
    } else if (type === "update-product") {
      pageTitle = "Update your product";
    }
    useHandleItemStore.getState().setPageTitle(pageTitle);

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
