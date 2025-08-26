import { createFileRoute } from "@tanstack/react-router";
import ProductPage from "../../pages/Product";
import { graphqlRequest } from "../../lib/graph-client";
import {
  GetIngredient,
  GetIngredientQuery,
} from "../../graphql/getProduct.gql";

export const Route = createFileRoute("/_protected/products/$id")({
  loader: async ({ params }) => {
    try {
      const result = await graphqlRequest<GetIngredientQuery>(GetIngredient, {
        id: params.id,
      });

      if (!result.ingredient) {
        throw new Error(`Product with ID ${params.id} not found`);
      }

      return {
        data: result.ingredient,
        meta: {
          id: params.id,
          loadedAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      throw error;
    }
  },
  component: ProductPage,
});
