"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Package, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import type { Ingredient } from "@/types/stocks";

export function useIngredientsColumns(
  isRegisterLostMode: boolean
): ColumnDef<Ingredient>[] {
  return [
    {
      accessorKey: "name",
      header: "Product Name",
      cell: ({ row }) => {
        const ingredient = row.original;
        return (
          <div className="flex items-center space-x-3">
            {ingredient.image_url ? (
              <img
                src={ingredient.image_url}
                alt={ingredient.name}
                className="h-10 w-10 rounded-md object-cover"
                onError={(e) => (e.currentTarget.style.display = "none")}
              />
            ) : (
              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div
              className="font-medium truncate max-w-[160px]"
              title={ingredient.name}
            >
              {ingredient.name}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "quantities",
      header: "Quantity",
      cell: ({ row }) => {
        const ingredient = row.original;
        const total = ingredient.quantities.reduce(
          (sum, q) => sum + q.quantity,
          0
        );
        return <div className="font-medium">{total.toFixed(1)}</div>;
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
        const firstCategory = ingredient.categories[0];
        const remainingCount = ingredient.categories.length - 1;

        return (
          <div className="flex items-center gap-1">
            {firstCategory && (
              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-secondary">
                {firstCategory.name}
              </span>
            )}
            {remainingCount > 0 && (
              <span className="text-xs text-muted-foreground">
                +{remainingCount}
              </span>
            )}
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
            <Button variant="destructive" size="icon">
              <Trash2 className="h-4 w-4" />
            </Button>
          );
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(ingredient.id)}
              >
                Copy ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
}
