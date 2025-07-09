import { createFileRoute } from "@tanstack/react-router";
import HandleItem from "../../pages/HandleItem";
import { graphqlRequest } from "../../lib/graph-client";
import {
  GetLocations,
  GetLocationsQuery,
} from "../../graphql/getLocations.gql";

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
    const data = await graphqlRequest<GetLocationsQuery>(GetLocations);
    const availableLocations = data.locations.data || [];

    if (mode === "scan") {
      // TODO: Handle fetch the backend with the barcode
      const res = await fetch(
        `https://world.openfoodfacts.net/api/v3/product/${barcode}?product_type=all&cc=us&lc=us&fields=image_url%2Cimage_small_url%2Cproduct_name%2Cgeneric_name%2Ccategories%2Cquantity%2Cbrands%2Cpackaging%2Cingredients_text%2Cnutriments%2Cnutrient_levels%2Clabels%2Cadditives_tags%2Callergens_tags%2Ctraces_tags%2Cemb_codes_tags%2Clinks`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch product data");
      }

      const data = await res.json();

      if (!data.product) {
        throw new Error("Product not found");
      }

      if (data.product.categories) {
        data.product.categories = data.product.categories
          .split(",")
          .map((category: string) => category.trim());
      } else {
        data.product.categories = [];
      }

      return {
        mode,
        type,
        barcode,
        product: data.product || null,
        availableLocations,
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
