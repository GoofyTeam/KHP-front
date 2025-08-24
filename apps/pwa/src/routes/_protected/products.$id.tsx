import { createFileRoute } from "@tanstack/react-router";
import ProductPage from "../../pages/Product";
import { graphqlRequest } from "../../lib/graph-client";
import {
  GetIngredient,
  GetIngredientQuery,
} from "../../graphql/getProduct.gql";

export const Route = createFileRoute("/_protected/products/$id")({
  loader: async ({ params }) => {
    const { id } = params;

    const productData = await graphqlRequest<GetIngredientQuery>(
      GetIngredient,
      {
        id,
      }
    );

    if (!productData.ingredient) {
      throw new Error("Product not found");
    }

    return productData.ingredient;
  },
  component: ProductPage,
});
