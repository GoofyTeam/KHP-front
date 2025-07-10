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
    const data = await graphqlRequest<GetIngredientQuery>(GetIngredient, {
      id,
    });
    
    return data.ingredient;
  },
  component: ProductPage,
});
