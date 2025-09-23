import { createFileRoute, redirect } from "@tanstack/react-router";
import { graphqlRequest } from "../../lib/graph-client";
import {
  GetLocationsDocument,
  type GetLocationsQuery,
} from "@workspace/graphql";
import handleScanType from "../../lib/handleScanType";
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
    const locationQuery = await graphqlRequest<GetLocationsQuery>(GetLocationsDocument);
    const availableLocations = locationQuery.locations.data || [];

    const productData = await handleScanType("internalId", internalId);

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

    return { product: productData, availableLocations };
  },
  component: MoveQuantity,
});
