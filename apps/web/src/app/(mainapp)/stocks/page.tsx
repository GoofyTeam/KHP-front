import { query } from "@/lib/ApolloClient";
import { GetCategoriesDocument } from "@/graphql/generated/graphql";
import StocksFilters from "@/components/stocks/stocks-filters";
import { IngredientsTable } from "@/components/stocks/ingredients-table/ingredients-table";

interface Category {
  id: string;
  name: string;
}

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

  const initialCategories: Category[] = categoriesData?.categories?.data || [];

  return (
    <div className="space-y-6">
      <StocksFilters initialCategories={initialCategories} />
      <IngredientsTable />
    </div>
  );
}
