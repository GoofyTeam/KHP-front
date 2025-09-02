import { createFileRoute, redirect } from "@tanstack/react-router";
import { graphqlRequest } from "../../lib/graph-client";
import {
  GetLocations,
  GetLocationsQuery,
} from "../../graphql/getLocations.gql";
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
    const locationQuery = await graphqlRequest<GetLocationsQuery>(GetLocations);
    const availableLocations = locationQuery.locations.data || [];

    const productData = await handleScanType("internalId", internalId);

    useHandleItemStore
      .getState()
      .setPageTitle(`Move quantity for ${productData.product_name}`);

    return { product: productData, availableLocations };
  },
  component: MoveQuantity,
});
