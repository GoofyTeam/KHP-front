import { query } from "@/lib/ApolloClient";
import { GetCategoriesDocument } from "@/graphql/generated/graphql";
import StocksContainer from "@/components/stocks-container";

export default async function StocksPage() {
  const { data: categoriesData, error: categoriesError } = await query({
    query: GetCategoriesDocument,
  });

  if (categoriesError) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-red-500">Error</h1>
        <p className="text-red-500">
          {categoriesError.message ||
            "An error occurred while fetching categories."}
        </p>
      </div>
    );
  }

  const initialCategories = categoriesData?.categories?.data || [];

  return <StocksContainer initialCategories={initialCategories} />;
}
