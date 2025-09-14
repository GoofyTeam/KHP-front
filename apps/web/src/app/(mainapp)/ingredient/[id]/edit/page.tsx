import { notFound } from "next/navigation";
import { fetchIngredient } from "@/queries/ingredient-query";
import { EditIngredientForm } from "@/components/ingredient/edit-ingredient-form";

interface EditIngredientRouteProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditIngredientRoute({
  params,
}: EditIngredientRouteProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const ingredient = await fetchIngredient(id);

  return (
    <div className="bg-khp-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="relative">
          <h1 className="text-2xl sm:text-3xl font-bold text-khp-text-primary mb-2">
            Edit Ingredient: {ingredient.name}
          </h1>
          <p className="text-khp-text-secondary text-lg">
            Update your ingredient information
          </p>
        </div>

        <EditIngredientForm ingredient={ingredient} />
      </div>
    </div>
  );
}
