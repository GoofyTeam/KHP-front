import { createFileRoute, redirect } from "@tanstack/react-router";
import HandleItem from "../../pages/handleItem/HandleItem";
import { graphqlRequestWithOffline } from "../../lib/offline-graphql";
import {
  GetLocationsDocument,
  type GetLocationsQuery,
  GetCategoriesDocument,
  type GetCategoriesQuery,
} from "@workspace/graphql";

import handleScanType from "../../lib/handleScanType";
import { saveIngredientSnapshot } from "../../lib/ingredient-cache";
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
    const productToFetch = internalId ?? barcode;
    if (!productToFetch && mode !== "manual")
      throw new Error("Product identifier is required");

    let scanResult;
    try {
      scanResult = await handleScanType(mode, productToFetch);
    } catch (error) {
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      if (isOffline) {
        return {
          availableLocations: [] as GetLocationsQuery["locations"]["data"],
          categories: [] as GetCategoriesQuery["categories"]["data"],
          product: null,
          type,
          productId: productToFetch,
          dataSources: {
            locations: { source: "missing-offline" as const, timestamp: null },
            categories: { source: "missing-offline" as const, timestamp: null },
            product: { source: "missing-offline" as const, timestamp: null },
          },
          status: "missing-offline" as const,
        };
      }
      throw error;
    }

    const productData = scanResult.data;

    await saveIngredientSnapshot(productData, {
      barcode: barcode ?? undefined,
    });

    const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

    let availableLocations: GetLocationsQuery["locations"]["data"] = [];
    let locationsSource: "network" | "cache" | "missing-offline" = "network";
    let locationsTimestamp: number | null = null;

    try {
      const { data, source, timestamp } =
        await graphqlRequestWithOffline<GetLocationsQuery>(
          GetLocationsDocument
        );
      availableLocations = data.locations.data || [];
      locationsSource = source;
      locationsTimestamp = timestamp;
    } catch (error) {
      if (!isOffline) {
        throw error;
      }
      const fallback = (productData.quantities || [])
        .map((qty) => qty.location)
        .filter(
          (loc): loc is NonNullable<typeof loc> => loc != null
        )
        .map((loc) => ({
          __typename: loc.__typename ?? "Location",
          id: loc.id,
          name: loc.name,
          locationType: loc.locationType ?? null,
        }));
      availableLocations = fallback as unknown as GetLocationsQuery["locations"]["data"];
      locationsSource = "missing-offline";
      locationsTimestamp = null;
    }

    let categories = [] as GetCategoriesQuery["categories"]["data"];
    let categoriesSource: "network" | "cache" | "missing-offline" = "network";
    let categoriesTimestamp: number | null = null;

    try {
      const { data, source, timestamp } =
        await graphqlRequestWithOffline<GetCategoriesQuery>(
          GetCategoriesDocument
        );
      categories = data.categories.data || [];
      categoriesSource = source;
      categoriesTimestamp = timestamp;
    } catch (error) {
      if (!isOffline) {
        throw error;
      }
      categories = [];
      categoriesSource = "missing-offline";
      categoriesTimestamp = null;
    }

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

    if (
      scanMode === "remove-mode" &&
      !productData.product_already_in_database &&
      barcode
    ) {
      redirect({
        to: "/handle-item",
        search: {
          type: "add-product",
          mode: "barcode",
          scanMode: "stock-mode",
          barcode: barcode,
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
      dataSources: {
        locations: {
          source: locationsSource,
          timestamp: locationsTimestamp,
        },
        categories: {
          source: categoriesSource,
          timestamp: categoriesTimestamp,
        },
        product: {
          source: scanResult.source,
          timestamp: scanResult.timestamp,
        },
      },
      status: "ok" as const,
    };
  },
  component: HandleItem,
});
