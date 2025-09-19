import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { ImagePlaceholder } from "@workspace/ui/components/image-placeholder";
import { GetIngredientQuery } from "@/graphql/generated/graphql";
import { CategoryBadge } from "../category-badge";
import { Edit, PackageMinus, PackagePlus } from "lucide-react";
import DeleteIngredient from "./delete-ingredient";

type IngredientData = NonNullable<GetIngredientQuery["ingredient"]>;

interface IngredientDetailsProps {
  ingredient: IngredientData;
  showMoveQuantity?: boolean;
}

export function IngredientDetails({
  ingredient,
  showMoveQuantity = true,
}: IngredientDetailsProps) {
  return (
    <>
      <div className="text-center space-y-4 w-full max-w-lg relative">
        <div className="flex justify-center items-center gap-2">
          <h1 className="text-3xl lg:text-5xl font-bold text-khp-text-primary leading-tight flex items-center justify-start gap-2 max-w-xs lg:max-w-md text-wrap">
            {ingredient.name}
          </h1>
        </div>

        <div className="flex justify-center items-center gap-2 flex-wrap">
          <CategoryBadge
            categories={ingredient.category ? [ingredient.category] : []}
          />
        </div>

        <div className="flex justify-center items-center gap-2">
          <Button variant="ghost" size="icon" title="Edit ingredient" asChild>
            <Link href={`/ingredient/${ingredient.id}/edit`}>
              <Edit
                className="h-6 w-6 text-khp-text-secondary"
                strokeWidth={1.5}
                size={32}
              />
            </Link>
          </Button>
          <DeleteIngredient id={ingredient.id} />
        </div>
      </div>

      <div className="w-full lg:w-3/4 max-w-lg">
        <div className="aspect-square rounded-xl overflow-hidden bg-khp-background-secondary w-full">
          {ingredient.image_url ? (
            <img
              src={ingredient.image_url}
              alt={ingredient.name}
              width={200}
              height={200}
              className="w-full h-full object-cover transition-transform duration-300"
            />
          ) : (
            <ImagePlaceholder className="w-full h-full rounded-lg" />
          )}
        </div>
      </div>

      {showMoveQuantity && (
        <>
          <div className="w-full lg:w-3/4 max-w-lg">
            <div className="w-full grid grid-cols-2 gap-2 mb-2">
              <Link href={`/ingredient/${ingredient?.id}/add-stock`}>
                <Button variant="khp-outline" className="w-full">
                  <PackagePlus size={64} /> Add Stock
                </Button>
              </Link>
              <Link href={`/ingredient/${ingredient?.id}/remove-stock`}>
                <Button variant="khp-outline" className="w-full">
                  <PackageMinus size={64} /> Remove Stock
                </Button>
              </Link>
            </div>
            <Link href={`/ingredient/${ingredient.id}/move`}>
              <Button variant="khp-outline" size="xl-full">
                Move Quantity
              </Button>
            </Link>
          </div>
        </>
      )}
    </>
  );
}
