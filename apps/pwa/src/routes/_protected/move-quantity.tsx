import { createFileRoute, redirect } from "@tanstack/react-router";
import { graphqlRequestWithOffline } from "../../lib/offline-graphql";
import {
  GetLocationsDocument,
  type GetLocationsQuery,
} from "@workspace/graphql";
import handleScanType from "../../lib/handleScanType";
import { saveIngredientSnapshot } from "../../lib/ingredient-cache";
import { useHandleItemStore } from "../../stores/handleitem-store";
import MoveQuantity from "../../pages/handleItem/movequantity/MoveQuantity";

export type MoveQuantitySearch = {
  internalId: string;
};

export const Route = createFileRoute("/_protected/move-quantity")({
  validateSearch: (search: Record<string, unknown>): MoveQuantitySearch => {
    return {
      internalId: search.internalId as string,
    };
  },
  loaderDeps: ({ search }) => ({
    internalId: search.internalId,
  }),
  beforeLoad: async ({ search }) => {
    if (!search.internalId) {
      redirect({
        to: "/inventory",
        replace: true,
      });
    }
  },
  loader: async ({ deps: { internalId } }) => {
    let scanResult;
    try {
      scanResult = await handleScanType("internalId", internalId);
    } catch (error) {
      const isOffline = typeof navigator !== "undefined" && !navigator.onLine;
      if (isOffline) {
        return {
          product: null,
          availableLocations: [] as GetLocationsQuery["locations"]["data"],
          dataSources: {
            product: { source: "missing-offline" as const, timestamp: null },
            locations: { source: "missing-offline" as const, timestamp: null },
          },
          status: "missing-offline" as const,
        };
      }
      throw error;
    }

    const productData = scanResult.data;

    await saveIngredientSnapshot(productData);

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
      availableLocations = ((productData.quantities || [])
        .map((qty) => qty.location)
        .filter(
          (loc): loc is NonNullable<typeof loc> => loc != null
        )
        .map((loc) => ({
          __typename: loc.__typename ?? "Location",
          id: loc.id,
          name: loc.name,
          locationType: loc.locationType ?? null,
        })) as unknown) as GetLocationsQuery["locations"]["data"];
      locationsSource = "missing-offline";
      locationsTimestamp = null;
    }

    // Vérifier si le produit a des quantités disponibles pour le déplacement
    const getTotalQuantity = (product: {
      quantities?: Array<{ quantity?: number }>;
    }) => {
      if (!product.quantities) return 0;
      return product.quantities.reduce(
        (total: number, qty: { quantity?: number }) =>
          total + (qty.quantity || 0),
        0
      );
    };

    if (!productData.quantities || getTotalQuantity(productData) <= 0) {
      const productId = productData.product_internal_id;
      if (productId) {
        throw redirect({
          to: "/products/$id",
          params: { id: productId },
          replace: true,
        });
      } else {
        throw redirect({
          to: "/inventory",
          replace: true,
        });
      }
    }

    useHandleItemStore
      .getState()
      .setPageTitle(`Move quantity for ${productData.product_name}`);

    return {
      product: productData,
      availableLocations,
      dataSources: {
        product: {
          source: scanResult.source,
          timestamp: scanResult.timestamp,
        },
        locations: {
          source: locationsSource,
          timestamp: locationsTimestamp,
        },
      },
      status: "ok" as const,
    };
  },
  component: MoveQuantity,
});
