import { query } from "@/lib/ApolloClient";

import {
  GetMenuByIdDocument,
  GetMenuTypesDocument,
  MenuServiceTypeEnum,
} from "@/graphql/generated/graphql";
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
import { Separator } from "@workspace/ui/components/separator";

const SERVICE_TYPE_LABELS: Record<MenuServiceTypeEnum, string> = {
  [MenuServiceTypeEnum.Direct]: "Direct service",
  [MenuServiceTypeEnum.Prep]: "Kitchen preparation",
};

export default async function MenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [menuResult, menuTypesResult] = await Promise.all([
    query({
      query: GetMenuByIdDocument,
      variables: { id },
      fetchPolicy: "network-only",
    }),
    query({
      query: GetMenuTypesDocument,
      fetchPolicy: "cache-first",
    }),
  ]);

  const { data, error } = menuResult;

  if (error) {
    console.error("GraphQL error:", error);
    throw error;
  }

  const menu = data.menu;
  const menuTypes = menuTypesResult.data?.menuTypes ?? [];
  const menuType = menu
    ? menuTypes.find((type) => String(type.id) === String(menu.menu_type_id))
    : undefined;
  const menuTypeDisplay = menuType?.name ?? menu?.menu_type_id ?? null;
  const menuTypeBadge = menuTypeDisplay
    ? [
        {
          id: menuType?.id ?? String(menu?.menu_type_id ?? "unknown"),
          name: menuTypeDisplay,
        },
      ]
    : undefined;

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 h-full items-center justify-center py-2 ">
      <div className="flex flex-col gap-8 justify-center items-center w-full lg:w-1/2">
        <div className="text-center space-y-4 w-full max-w-lg relative">
          <div className="flex justify-center items-center gap-2">
            <h1 className="text-3xl lg:text-5xl font-bold text-khp-text-primary leading-tight flex items-center justify-start gap-2 max-w-xs lg:max-w-md text-wrap">
              {menu?.name}
            </h1>
          </div>

          <div className="flex justify-center items-center gap-2 flex-wrap">
            <p className="text-khp-text-secondary font-bold">
              {menu?.is_a_la_carte ? "A la carte" : "Set menu"}
            </p>
          </div>
          <div className="flex justify-center items-center gap-2 flex-wrap">
            {menuTypeBadge && <CategoryBadge categories={menuTypeBadge} />}
            <Separator
              orientation="vertical"
              className="h-4 w-px bg-khp-border"
            />
            <CategoryBadge categories={menu?.categories || []} />
          </div>

          <div className="flex justify-center items-center gap-2">
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

        <div className="hidden lg:block">
          <Button variant="link" asChild>
            <Link href="/menus" className="text-khp-primary">
              <ChevronLeft /> Back to menus
            </Link>
          </Button>
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
          <div className="flex flex-wrap gap-4 text-sm text-khp-text-secondary">
            <span>
              <span className="font-semibold text-khp-text-primary">
                Service:
              </span>{" "}
              {menu?.service_type
                ? (SERVICE_TYPE_LABELS[menu.service_type] ?? menu.service_type)
                : "N/A"}
            </span>
            <span>
              <span className="font-semibold text-khp-text-primary">
                Returnable:
              </span>{" "}
              {menu?.is_returnable ? "Yes" : "No"}
            </span>
            <span>
              <span className="font-semibold text-khp-text-primary">
                Priority:
              </span>{" "}
              {typeof menu?.public_priority === "number"
                ? menu.public_priority
                : "—"}
            </span>
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
