"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Package, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { StockStatus } from "@workspace/ui/components/stock-status";
import type { Ingredient } from "@/types/stocks";
import { getStockStatus } from "@/hooks/useIngredients";

export function useColumns(
  isRegisterLostMode: boolean
): ColumnDef<Ingredient>[] {
  return useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Product name",
        cell: ({ row }) => {
          const ingredient = row.original;
          return (
            <div className="flex items-center space-x-3 min-w-0">
              {ingredient.image_url ? (
                <img
                  src={ingredient.image_url}
                  alt={ingredient.name}
                  className="h-10 w-10 rounded-md object-cover flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div
                  className="font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[160px]"
                  title={ingredient.name}
                >
                  {ingredient.name}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "quantities",
        header: "Qty",
        cell: ({ row }) => {
          const ingredient = row.original;
          const totalQuantity = ingredient.quantities.reduce(
            (sum, q) => sum + q.quantity,
            0
          );
          return (
            <div className="font-medium whitespace-nowrap">
              {totalQuantity.toFixed(1)}
            </div>
          );
        },
      },
      {
        accessorKey: "unit",
        header: "Unit",
        cell: ({ row }) => <div>{row.getValue("unit")}</div>,
      },
      {
        accessorKey: "categories",
        header: "Category",
        cell: ({ row }) => {
          const ingredient = row.original;
          return (
            <div className="flex flex-wrap gap-1 max-w-[130px]">
              {ingredient.categories.slice(0, 1).map((category) => (
                <span
                  key={category.id}
                  className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap"
                >
                  {category.name}
                </span>
              ))}
              {ingredient.categories.length > 1 && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  +{ingredient.categories.length - 1}
                </span>
              )}
            </div>
          );
        },
      },

      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const ingredient = row.original;
          const status = getStockStatus(ingredient.quantities);
          return (
            <div className="whitespace-nowrap">
              <StockStatus variant={status} showLabel />
            </div>
          );
        },
      },
      {
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          const ingredient = row.original;

          if (isRegisterLostMode) {
            return (
              <div className="flex items-center justify-center">
                <Trash2 className="h-4 w-4 text-destructive" />
              </div>
            );
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(ingredient.id)}
                >
                  Copy ingredient ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Edit ingredient</DropdownMenuItem>
                <DropdownMenuItem>View details</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Delete ingredient
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [isRegisterLostMode]
  );
}
