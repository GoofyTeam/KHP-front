import { notFound } from "next/navigation";
import { query } from "@/lib/ApolloClient";
import { GetIngredientDocument } from "@/graphql/generated/graphql";
import type { Ingredient } from "../../../../types/stocks";
import Link from "next/link";
import Image from "next/image";
import { CategoryBadge } from "../../../../components/category-badge";
import { Button } from "@workspace/ui/components/button";
import { MovementHistory } from "../../../../components/movement-history";
import { IngredientStockDisplay } from "../../../../components/ingredient-stock-display";
import { IngredientHeader } from "../../../../components/ingredient-header";

interface IngredientPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function fetchIngredient(id: string): Promise<Ingredient> {
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

export default async function IngredientPage({ params }: IngredientPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const ingredient = await fetchIngredient(id);

  return (
    <>
      <IngredientHeader />
      <div className="w-full flex flex-col lg:flex-row gap-8">
        {/* Colonne 1 */}
        <div className="flex flex-col gap-8 justify-center items-center w-full lg:w-1/2">
          <div className="text-center space-y-4 w-full lg:w-3/4 max-w-md">
            <h1 className="text-3xl lg:text-5xl font-bold text-khp-text-primary leading-tight">
              {ingredient.name}
            </h1>
            <CategoryBadge categories={ingredient.categories} />
          </div>
          <div className="w-full lg:w-1/2 max-w-md">
            <div className="aspect-square rounded-xl overflow-hidden bg-khp-background-secondary">
              {ingredient.image_url ? (
                <Image
                  src={ingredient.image_url}
                  alt={ingredient.name}
                  width={200}
                  height={200}
                  className="w-full h-full  transition-transform duration-300"
                  unoptimized={process.env.NODE_ENV === "development"}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-2xl font-bold mb-2">HEINZ</div>
                    <div className="text-lg">BAKED</div>
                    <div className="text-lg">BEANS</div>
                    <div className="text-sm mt-2">
                      in Delicious Tomato Sauce
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="mt-8 w-full lg:w-3/4 max-w-md">
            <Link href={`/ingredient/${id}/move`}>
              <Button variant="khp-outline" size="xl-full">
                Move Quantity
              </Button>
            </Link>
          </div>
        </div>

        {/* Colonne 2 */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center mb-10 lg:mb-0">
          <IngredientStockDisplay ingredient={ingredient} />

          <div className="w-full lg:w-3/4 max-w-md">
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
