import { query } from "@/lib/ApolloClient";

import { GetPreparationByIdDocument } from "@workspace/graphql";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import {
  ArrowLeftRight,
  ChevronLeft,
  Edit,
  Funnel,
  PackageMinus,
  PackagePlus,
} from "lucide-react";
import { CategoryBadge } from "@/components/category-badge";
import { ImagePlaceholder } from "@workspace/ui/components/image-placeholder";
import { MealsIngredientDataTable } from "@/components/meals/meals-ingredients-data-table";
import { PreparationAvailabilityBadge } from "@workspace/ui/components/availability-badge";
import { PreparationIngredientColumns } from "@/components/preparation/preparation-ingredient-columns";
import { IngredientStockDisplay } from "@/components/ingredient/ingredient-stock-display";
import { formatQuantity } from "@/lib/formatQuantity";
import DeletePreparation from "@/components/preparation/delete-preparation";
import { cn } from "@workspace/ui/lib/utils";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data, error } = await query({
    query: GetPreparationByIdDocument,
    variables: { id },
    fetchPolicy: "network-only",
  });

  if (error) {
    console.error("GraphQL error:", error);
    throw error;
  }

  const preparation = data.preparation;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 h-full items-center justify-center py-2 ">
      <div className="flex flex-col gap-8 justify-center items-center w-full lg:w-1/2">
        <div className="text-center space-y-4 w-full max-w-lg relative">
          <div className="flex justify-center items-center gap-2">
            <h1 className="text-3xl lg:text-5xl font-bold text-khp-text-primary leading-tight flex items-center justify-start gap-2 max-w-xs lg:max-w-md text-wrap">
              {preparation?.name}
            </h1>
          </div>

          <div className="flex justify-center items-center gap-2 flex-wrap">
            <CategoryBadge categories={preparation?.categories || []} />
          </div>

          <div className="flex justify-center items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              title="Edit preparations"
              asChild
            >
              <Link href={`/preparations/${preparation?.id}/edit`}>
                <Edit
                  className="h-6 w-6 text-khp-text-secondary"
                  strokeWidth={1.5}
                  size={32}
                />
              </Link>
            </Button>
            <DeletePreparation id={preparation?.id} />
          </div>
        </div>
        <div className="w-full lg:w-3/4 max-w-lg">
          <div className="aspect-square rounded-xl overflow-hidden bg-khp-background-secondary w-full">
            {preparation?.image_url ? (
              <img
                src={preparation.image_url}
                alt={preparation.name}
                width={200}
                height={200}
                className="w-full h-full object-cover transition-transform duration-300"
              />
            ) : (
              <ImagePlaceholder className="w-full h-full rounded-lg" />
            )}
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-4 lg:gap-8">
          <Link
            href={
              (preparation?.preparable_quantity?.quantity ?? 0) > 0
                ? `/preparations/${preparation?.id}/prepare`
                : `#`
            }
          >
            <Button
              variant="khp-outline"
              className={cn(
                "w-full",
                (preparation?.preparable_quantity?.quantity ?? 0) <= 0 &&
                  "opacity-50 cursor-not-allowed!"
              )}
              disabled={(preparation?.preparable_quantity?.quantity ?? 0) <= 0}
            >
              <Funnel size={64} /> Prepare
            </Button>
          </Link>
          <Link href={`/preparations/${preparation?.id}/move-stock`}>
            <Button variant="khp-outline" className="w-full">
              <ArrowLeftRight size={64} /> Move Stock
            </Button>
          </Link>
          <Link href={`/preparations/${preparation?.id}/add-stock`}>
            <Button variant="khp-outline" className="w-full">
              <PackagePlus size={64} /> Add Stock
            </Button>
          </Link>
          <Link href={`/preparations/${preparation?.id}/remove-stock`}>
            <Button variant="khp-outline" className="w-full">
              <PackageMinus size={64} /> Remove Stock
            </Button>
          </Link>
        </div>

        <div className="hidden lg:block">
          <Button variant="link" asChild>
            <Link href="/preparations" className="text-khp-primary">
              <ChevronLeft /> Back to preparations
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col w-full lg:w-1/2 gap-y-4">
        {preparation && <IngredientStockDisplay preparation={preparation} />}
        <PreparationAvailabilityBadge
          available={(preparation?.preparable_quantity?.quantity ?? 0) > 0}
          quantityPossible={`${formatQuantity(preparation?.preparable_quantity.quantity ?? 0)} ${preparation?.preparable_quantity.unit}`}
        />
        <MealsIngredientDataTable
          columns={PreparationIngredientColumns}
          data={preparation?.entities || []}
        />
        <div className="lg:hidden mx-auto">
          <Button variant="link" asChild>
            <Link href="/preparations" className="text-khp-primary">
              <ChevronLeft /> Back to preparations
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
