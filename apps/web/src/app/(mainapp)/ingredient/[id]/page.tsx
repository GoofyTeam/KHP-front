import { notFound } from "next/navigation";
import { query } from "@/lib/ApolloClient";
import {
  GetIngredientDocument,
  GetIngredientQuery,
} from "@/graphql/generated/graphql";
import { IngredientDetails } from "../../../../components/ingredient/ingredient-details";
import { IngredientStockDisplay } from "../../../../components/ingredient/ingredient-stock-display";
import { MovementHistory } from "../../../../components/ingredient/movement-history";

interface IngredientPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function fetchIngredient(
  id: string
): Promise<NonNullable<GetIngredientQuery["ingredient"]>> {
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
}

export default async function IngredientPage({ params }: IngredientPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const ingredient = await fetchIngredient(id);

  return (
    <>
      <div className="w-full flex flex-col lg:flex-row gap-8">
        {/* Colonne 1 */}
        <div className="flex flex-col gap-8 justify-center items-center w-full lg:w-1/2">
          <IngredientDetails ingredient={ingredient} />
        </div>

        {/* Colonne 2 */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center mb-10 lg:mb-0">
          <div className="w-full lg:w-3/4 max-w-lg">
            <IngredientStockDisplay ingredient={ingredient} />
            <MovementHistory
              movements={ingredient.stockMovements || []}
              unit={ingredient.unit}
            />
          </div>
        </div>
      </div>
    </>
  );
}
