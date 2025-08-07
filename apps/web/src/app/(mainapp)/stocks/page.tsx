import { query } from "@/lib/ApolloClient";
import {
  GetIngredientsDocument,
  GetCategoriesDocument,
} from "@/graphql/generated/graphql";
import StocksClient from "./client";

export default async function StocksPage() {
  const { data, loading, error } = await query({
    query: GetIngredientsDocument,
    variables: {
      page: 1,
    },
  });

  const { data: categoriesData, error: categoriesError } = await query({
    query: GetCategoriesDocument,
  });

  if (loading) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <h1 className="text-2xl font-bold">Loading...</h1>
        <p>Please wait while we fetch the stocks data.</p>
      </div>
    );
  }

  if (error || categoriesError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p className="text-red-500">
          {error?.message ||
            categoriesError?.message ||
            "An error occurred while fetching the data."}
        </p>
      </div>
    );
  }

  // Extraction des données pour le client
  const initialIngredients = data?.ingredients;
  const initialCategories = categoriesData?.categories;

  return (
    <StocksClient
      initialIngredients={initialIngredients}
      initialCategories={initialCategories}
    />
  );
}
