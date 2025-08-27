import Image from "next/image";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { ImagePlaceholder } from "@workspace/ui/components/image-placeholder";
import { CategoryBadge } from "../category-badge";
import { GetIngredientQuery } from "@/graphql/generated/graphql";
import { Edit } from "lucide-react";

type IngredientData = NonNullable<GetIngredientQuery["ingredient"]>;

interface IngredientDetailsProps {
  ingredient: IngredientData;
}

export function IngredientDetails({ ingredient }: IngredientDetailsProps) {
  return (
    <>
      <div className="text-center space-y-4 w-full max-w-lg relative">
        <div className="flex justify-center items-cente gap-2">
          <h1 className="text-3xl lg:text-5xl font-bold text-khp-text-primary leading-tight">
            {ingredient.name}
          </h1>
          <Link href={`/ingredient/${ingredient.id}/edit`}>
            <Button variant="ghost" size="icon" title="Modifier l'ingrédient">
              <Edit className="h-4 w-4 text-khp-text-secondary" />
            </Button>
          </Link>
        </div>

        <CategoryBadge categories={ingredient.categories} />
      </div>

      <div className="w-full lg:w-3/4 max-w-lg">
        <div className="aspect-square rounded-xl overflow-hidden bg-khp-background-secondary w-full">
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

      <div className="w-full lg:w-3/4 max-w-lg">
        <Link href={`/ingredient/${ingredient.id}/move`}>
          <Button variant="khp-outline" size="xl-full">
            Move Quantity
          </Button>
        </Link>
      </div>
    </>
  );
}
