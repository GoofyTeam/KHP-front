import { createFileRoute } from "@tanstack/react-router";
import InventoryPage from "../../pages/Inventory";
import { graphqlRequest } from "../../lib/graph-client";
import {
  GetCompanyProducts,
  GetCompanyProductsQuery,
} from "../../graphql/getCompanyProducts.gql";

export const Route = createFileRoute("/_protected/inventory")({
  loader: async () => {
    const data =
      await graphqlRequest<GetCompanyProductsQuery>(GetCompanyProducts);

    const ingredients = data.ingredients.data ?? [];

    return {
      ingredients,
    };
  },
  component: InventoryPage,
});
