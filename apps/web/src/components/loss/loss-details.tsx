import Image from "next/image";
import { ImagePlaceholder } from "@workspace/ui/components/image-placeholder";
import { CategoryBadge } from "../category-badge";
import { GetIngredientQuery } from "@/graphql/generated/graphql";

type IngredientData = NonNullable<GetIngredientQuery["ingredient"]>;

interface LossDetailsProps {
  ingredient: IngredientData;
}

export function LossDetails({ ingredient }: LossDetailsProps) {
  return (
    <>
      <div className="text-center space-y-4 w-full lg:w-3/4 max-w-md">
        <h1 className="text-3xl lg:text-5xl font-bold text-khp-text-primary leading-tight">
          {ingredient.name}
        </h1>
        <CategoryBadge categories={ingredient.category} />
      </div>

      <div className="w-full lg:w-3/4 max-w-md">
        <div className="aspect-square rounded-xl overflow-hidden bg-khp-background-secondary">
          {ingredient.image_url ? (
            <Image
              src={ingredient.image_url}
              alt={ingredient.name}
              width={400}
              height={400}
              className="w-full h-full object-cover transition-transform duration-300"
              unoptimized={process.env.NODE_ENV === "development"}
            />
          ) : (
            <ImagePlaceholder className="w-full h-full rounded-lg" />
          )}
        </div>
      </div>
    </>
  );
}
