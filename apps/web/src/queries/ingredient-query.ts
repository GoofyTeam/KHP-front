import { notFound } from "next/navigation";
import { query } from "@/lib/ApolloClient";
import {
  GetIngredientDocument,
  GetIngredientQuery,
} from "@/graphql/generated/graphql";

/**
 * Fetch a single ingredient by ID
 */
export async function fetchIngredient(
  id: string
): Promise<NonNullable<GetIngredientQuery["ingredient"]>> {
  try {
    const { data, error } = await query({
      query: GetIngredientDocument,
      variables: { id },
    });

    if (error) {
      console.error("GraphQL error:", error);
      throw error;
    }

    if (!data?.ingredient) {
      notFound();
    }

    return data.ingredient;
  } catch (error) {
    console.error("Error fetching ingredient:", error);

    if (error instanceof Error) {
      if (error.message.includes("Unauthenticated")) {
        throw error;
      }
      if (error.message.includes("not found")) {
        notFound();
      }
    }

    throw error;
  }
}
