import { notFound } from "next/navigation";
import { fetchIngredient } from "@/queries/ingredient-query";
import { RemoveStockForm } from "./remove-stock-form";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ChevronLeft, PackageMinus } from "lucide-react";
import { ImagePlaceholder } from "@workspace/ui/components/image-placeholder";

interface RemoveStockPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RemoveStockPage({
  params,
}: RemoveStockPageProps) {
  const { id } = await params;

  if (!id) {
    notFound();
  }

  const ingredient = await fetchIngredient(id);

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 h-full items-center justify-center py-2">
      <div className="flex flex-col gap-8 justify-center items-center w-full lg:w-1/2">
        <div className="text-center space-y-4 w-full max-w-lg relative">
          <div className="flex justify-center items-center gap-2">
            <PackageMinus className="h-8 w-8 text-khp-warning" />
            <h1 className="text-3xl lg:text-5xl font-bold text-khp-text-primary leading-tight flex items-center justify-start gap-2 max-w-xs lg:max-w-md text-wrap">
              Remove Stock
            </h1>
          </div>
          <p className="text-lg text-khp-text-secondary">{ingredient?.name}</p>
        </div>

        <div className="w-full lg:w-3/4 max-w-lg">
          <div className="aspect-square rounded-xl overflow-hidden bg-khp-background-secondary w-full">
            {ingredient?.image_url ? (
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

        <div className="hidden lg:block">
          <Button variant="link" asChild>
            <Link
              href={`/ingredient/${ingredient?.id}`}
              className="text-khp-primary"
            >
              <ChevronLeft /> Back to ingredient
            </Link>
          </Button>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center mb-10 lg:mb-0">
        <div className="w-full lg:w-3/4 max-w-lg">
          <RemoveStockForm ingredient={ingredient} />
        </div>
        <div className="lg:hidden mx-auto mt-8">
          <Button variant="link" asChild>
            <Link
              href={`/ingredient/${ingredient?.id}`}
              className="text-khp-primary"
            >
              <ChevronLeft /> Back to ingredient
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
