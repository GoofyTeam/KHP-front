import { notFound } from "next/navigation";
import { query } from "@/lib/ApolloClient";
import {
  GetIngredientDocument,
  GetIngredientQuery,
} from "@/graphql/generated/graphql";
import Link from "next/link";
import Image from "next/image";
import { CategoryBadge } from "../../../../components/category-badge";
import { Button } from "@workspace/ui/components/button";
import { MovementHistory } from "../../../../components/movement-history";
import { IngredientStockDisplay } from "../../../../components/ingredient-stock-display";
import { ImagePlaceholder } from "@workspace/ui/components/image-placeholder";

interface IngredientPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function fetchIngredient(
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
          <div className="text-center space-y-4 w-full max-w-lg">
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
                  className="w-full h-full object-cover transition-transform duration-300"
                  unoptimized={process.env.NODE_ENV === "development"}
                />
              ) : (
                <ImagePlaceholder className="w-full h-full rounded-lg" />
              )}
            </div>
          </div>
          <div className="mt-8 w-full lg:w-3/4 max-w-lg">
            <Link href={`/ingredient/${id}/move`}>
              <Button variant="khp-outline" size="xl-full">
                Move Quantity
              </Button>
            </Link>
          </div>
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
