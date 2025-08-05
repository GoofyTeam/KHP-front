import { httpClient } from "@/lib/httpClient";
import type {
  GraphQLResponse,
  IngredientResponse,
  Ingredient,
} from "@/types/stocks";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error(
    "Environment variable NEXT_PUBLIC_API_URL is not defined. Please set it in your environment."
  );
}

export const GET_INGREDIENT_QUERY = `
  query GetIngredient($id: ID!) {
    ingredient(id: $id) {
      id
      name
      unit
      image_url
      created_at
      updated_at
      categories {
        id
        name
      }
      quantities {
        quantity
        location {
          id
          name
          locationType {
            name
          }
        }
      }
    }
  }
`;

export interface GetIngredientVariables {
  id: string;
}

// Server-side GraphQL function
const getIngredientSSR = async (
  id: string,
  cookieHeader?: string
): Promise<IngredientResponse> => {
  const response = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: JSON.stringify({
      query: GET_INGREDIENT_QUERY,
      variables: { id },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => null);
    throw new Error(`${response.status}: ${errorText || response.statusText}`);
  }

  const result: GraphQLResponse<IngredientResponse> = await response.json();

  if (result.errors?.length) {
    const errorMessage = result.errors[0]?.message ?? "GraphQL Error";
    if (errorMessage === "Unauthenticated.") {
      throw new Error("UNAUTHENTICATED");
    }
    throw new Error(errorMessage);
  }

  if (!result.data?.ingredient) {
    throw new Error("Ingredient not found");
  }

  return result.data;
};

// Client-side GraphQL function
const getIngredientClient = async (id: string): Promise<IngredientResponse> => {
  const response = await httpClient.post<GraphQLResponse<IngredientResponse>>(
    "/graphql",
    {
      query: GET_INGREDIENT_QUERY,
      variables: { id },
    }
  );

  if (response.errors?.length) {
    const errorMessage = response.errors[0]?.message ?? "GraphQL Error";
    if (errorMessage === "Unauthenticated.") {
      throw new Error("UNAUTHENTICATED");
    }
    throw new Error(errorMessage);
  }

  if (!response.data?.ingredient) {
    throw new Error("Ingredient not found");
  }

  return response.data;
};

// Main function that decides between SSR and client-side
export const getIngredient = async (
  id: string,
  cookieHeader?: string
): Promise<IngredientResponse> => {
  const isServerSide = typeof window === "undefined";

  if (isServerSide) {
    return getIngredientSSR(id, cookieHeader);
  } else {
    return getIngredientClient(id);
  }
};
