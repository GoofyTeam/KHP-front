import { notFound } from "next/navigation";
import { query } from "@/lib/ApolloClient";
import { GetIngredientDocument } from "@/graphql/generated/graphql";
import type { Ingredient, IngredientQuantity } from "../../../../types/stocks";
import Link from "next/link";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@workspace/ui/components/carousel";
import { CategoryBadge } from "../../../../components/category-badge";
import { LocationSelector } from "../../../../components/location-selector";
import { Button } from "@workspace/ui/components/button";
import { StatCard } from "../../../../components/stat-card";
import { MovementHistory } from "../../../../components/movement-history";

interface IngredientPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function fetchIngredient(id: string): Promise<Ingredient> {
  try {
    const { data, loading, error } = await query({
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
        // This should be handled by middleware, but just in case
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

  // Calculate total stock
  const totalStock = ingredient.quantities.reduce(
    (sum: number, q: IngredientQuantity) => sum + q.quantity,
    0
  );

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 p-4 lg:p-8">
      {/* Colonne 1 */}
      <div className="flex flex-col gap-8 justify-center items-center w-full lg:w-1/2">
        {/* Product Title */}
        <div className="text-center space-y-4 w-full lg:w-3/4 max-w-md">
          <h1 className="text-3xl lg:text-5xl font-bold text-khp-text-primary leading-tight">
            {ingredient.name}
          </h1>
          <CategoryBadge categories={ingredient.categories} />
        </div>

        {/* Product Image */}
        <div className="w-full lg:w-3/4 max-w-md">
          <div className="aspect-square rounded-xl overflow-hidden bg-khp-background-secondary">
            {ingredient.image_url ? (
              <Image
                src={ingredient.image_url}
                alt={ingredient.name}
                width={400}
                height={400}
                className="w-full h-full  transition-transform duration-300"
                unoptimized={process.env.NODE_ENV === "development"}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-2xl font-bold mb-2">HEINZ</div>
                  <div className="text-lg">BAKED</div>
                  <div className="text-lg">BEANS</div>
                  <div className="text-sm mt-2">in Delicious Tomato Sauce</div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Action Button */}
        <div className="mt-8 w-full lg:w-3/4 max-w-md">
          <Button variant="khp-outline" size="xl-full">
            Déplacer la quantité
          </Button>
        </div>
      </div>

      {/* Colonne 2 */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center mb-10 lg:mb-0">
        <div className="w-full lg:w-3/4 max-w-md flex flex-col gap-6">
          {/* Product Description */}
          <p className="text-khp-text-secondary leading-relaxed">
            {ingredient.name} apporte des haricots fondants en sauce tomate
            sucrée-acidulée, idéale pour enrichir en un clin d&apos;œil purées,
            gratins ou mijotés.
          </p>
          {/* Location Selector */}
          <div className="mb-4">
            <LocationSelector
              quantities={ingredient.quantities}
              placeholder="Choisir un emplacement"
              label="Emplacement"
            />
          </div>
        </div>

        {/* Stats intégrées - Design épuré */}
        <div className="space-y-4 w-full lg:w-3/4 max-w-md">
          {/* Stock principal - Compact et élégant */}
          <div className="bg-khp-primary rounded-lg px-5 py-4 text-white">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-bold">{totalStock}</span>
                <span className="text-lg ml-2 opacity-90">
                  {ingredient.unit}
                </span>
              </div>
              <span className="text-sm opacity-80">Stock total</span>
            </div>
          </div>

          {/* Métriques compactes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg px-4 py-3 border border-khp-border">
              <div className="text-xl font-semibold text-khp-primary">
                {ingredient.quantities.length}
              </div>
              <div className="text-sm text-khp-text-secondary">
                Emplacements
              </div>
            </div>

            <div className="bg-white rounded-lg px-4 py-3 border border-khp-border">
              <div className="text-xl font-semibold text-khp-primary">
                {Math.round(totalStock / ingredient.quantities.length)}
                <span className="text-sm ml-1">{ingredient.unit}</span>
              </div>
              <div className="text-sm text-khp-text-secondary">Par lieu</div>
            </div>
          </div>

          {/* Movement History */}
          <MovementHistory
            movements={ingredient.stockMovements || []}
            unit={ingredient.unit}
          />
        </div>
      </div>
    </div>
  );
}
