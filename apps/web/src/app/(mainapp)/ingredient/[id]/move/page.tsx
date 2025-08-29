import { notFound } from "next/navigation";
import { fetchIngredient } from "@/queries/ingredient-query";
import { fetchLocations } from "@/queries/locations-query";
import { IngredientDetails } from "../../../../../components/ingredient/ingredient-details";
import { MoveQuantityForm } from "../../../../../components/move-quantity-form";

interface MovePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function MoveQuantityPage({ params }: MovePageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const [ingredient, locations] = await Promise.all([
    fetchIngredient(id),
    fetchLocations(),
  ]);

  return (
    <>
      <div className="w-full flex flex-col lg:flex-row gap-8">
        <div className="flex flex-col gap-8 justify-center items-center w-full h-fit lg:w-1/2">
          <IngredientDetails ingredient={ingredient} />
        </div>

        {/* Colonne 2 */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center mb-10 lg:mb-0">
          <div className="w-full lg:w-3/4 max-w-lg">
            <MoveQuantityForm
              ingredient={ingredient}
              allLocations={locations}
            />
          </div>
        </div>
      </div>
    </>
  );
}
