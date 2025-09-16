import { query } from "@/lib/ApolloClient";

import { GetMenuByIdDocument } from "@/graphql/generated/graphql";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, Edit } from "lucide-react";
import { CategoryBadge } from "@/components/category-badge";
import { ImagePlaceholder } from "@workspace/ui/components/image-placeholder";
import { AllegernsBadgesList } from "@workspace/ui/components/allergens-badge";
import { MealsIngredientDataTable } from "@/components/meals/meals-ingredients-data-table";
import { MealsIngredientColumns } from "@/components/meals/meals-ingredient-columns";
import { AvailabilityBadge } from "@workspace/ui/components/availability-badge";
import DeleteMenu from "@/components/meals/delete-menus";

export default async function MenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data, error } = await query({
    query: GetMenuByIdDocument,
    variables: { id },
    fetchPolicy: "network-only",
  });

  if (error) {
    console.error("GraphQL error:", error);
    throw error;
  }

  const menu = data.menu;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 h-full items-center justify-center py-2 ">
      <div className="flex flex-col gap-8 justify-center items-center w-full lg:w-1/2">
        <div className="text-center space-y-4 w-full max-w-lg relative">
          <div className="flex justify-center items-center gap-2">
            <h1 className="text-3xl lg:text-5xl font-bold text-khp-text-primary leading-tight flex items-center justify-start gap-2 truncate max-w-xs lg:max-w-md">
              {menu?.name}
            </h1>
            <div className="grid grid-cols-2 gap-1">
              <Button variant="ghost" size="icon" title="Edit menu" asChild>
                <Link href={`/menus/${menu?.id}/edit`}>
                  <Edit
                    className="h-6 w-6 text-khp-text-secondary"
                    strokeWidth={1.5}
                    size={32}
                  />
                </Link>
              </Button>
              <DeleteMenu id={menu?.id} />
            </div>
          </div>
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <p className="text-khp-text-secondary font-bold">
              {menu?.is_a_la_carte ? "À la carte" : "Not à la carte"}
            </p>
          </div>
          <div className="flex justify-center items-center gap-2 flex-wrap">
            <CategoryBadge categories={menu?.categories || []} />
            <CategoryBadge
              categories={[
                {
                  id: menu?.type || "unknown",
                  name: menu?.type || "Unknown",
                },
              ]}
            />
          </div>
        </div>
        <div className="w-full lg:w-3/4 max-w-lg">
          <div className="aspect-square rounded-xl overflow-hidden bg-khp-background-secondary w-full">
            {menu?.image_url ? (
              <img
                src={menu.image_url}
                alt={menu.name}
                width={200}
                height={200}
                className="w-full h-full object-cover transition-transform duration-300"
              />
            ) : (
              <ImagePlaceholder className="w-full h-full rounded-lg" />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col w-full lg:w-1/2 gap-y-4">
        <div className="w-full lg:w-3/4 max-w-lg gap-y-4 flex flex-col">
          <p className="text-khp-text-secondary text-lg">{menu?.description}</p>
          <div className="flex gap-x-8">
            <p className="text-khp-text-secondary">
              Price:{" "}
              <span className="text-khp-primary text-xl font-bold">
                {menu?.price ? `${menu.price.toFixed(2)} EUR` : "N/A"}
              </span>
            </p>
            <div className="flex gap-x-2">
              <p className="font-semibold text-khp-text-primary">Allergens:</p>
              <AllegernsBadgesList allergens={menu?.allergens || []} />
            </div>
          </div>
        </div>
        <AvailabilityBadge available={menu?.available || false} />
        <MealsIngredientDataTable
          columns={MealsIngredientColumns}
          data={menu?.items || []}
        />
        <div className="lg:hidden mx-auto">
          <Button variant="link" asChild>
            <Link href="/menus" className="text-khp-primary">
              <ChevronLeft /> Back to menus
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
