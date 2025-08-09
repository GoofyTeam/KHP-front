import { query } from "@/lib/ApolloClient";
import { GetCategoriesDocument } from "@/graphql/generated/graphql";
import StocksPage from "@/components/stocks/stocks-page";

export default async function Page() {
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

  return <StocksPage initialCategories={initialCategories} />;
}
