"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreVertical, Package, Trash2 } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import type { GetIngredientsQuery } from "@/graphql/generated/graphql";

type IngredientRow = GetIngredientsQuery["ingredients"]["data"][number];

export function useIngredientsColumns(
  isRegisterLostMode: boolean
): ColumnDef<IngredientRow>[] {
  return useMemo(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium hover:bg-transparent"
            >
              Product Name
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
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
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto !p-0 font-medium hover:bg-transparent"
            >
              Quantity
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const ingredient = row.original;
          const total = ingredient.quantities.reduce(
            (sum, q) => sum + q.quantity,
            0
          );
          return (
            <div className="font-medium text-left">{total.toFixed(1)}</div>
          );
        },
        sortingFn: (rowA, rowB) => {
          const totalA = rowA.original.quantities.reduce(
            (sum, q) => sum + q.quantity,
            0
          );
          const totalB = rowB.original.quantities.reduce(
            (sum, q) => sum + q.quantity,
            0
          );
          return totalA - totalB;
        },
      },
      {
        accessorKey: "unit",
        header: "Storage Unit",
        cell: ({ row }) => (
          <div className="text-left">{row.getValue("unit")}</div>
        ),
      },
      {
        accessorKey: "category",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="h-auto p-0 font-medium hover:bg-transparent"
            >
              Category
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          );
        },
        cell: ({ row }) => {
          const { category } = row.original;
          return category ? (
            <div className="flex items-center gap-1 justify-start">
              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-secondary">
                {category.name}
              </span>
            </div>
          ) : null;
        },
        sortingFn: (rowA, rowB) => {
          const categoryA = rowA.original.category?.name || "";
          const categoryB = rowB.original.category?.name || "";
          return categoryA.localeCompare(categoryB);
        },
      },
      {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        enableSorting: false,
        cell: ({ row }) => {
          const ingredient = row.original;

          if (isRegisterLostMode) {
            return (
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete ingredient</span>
              </Button>
            );
          }

          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
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
    ],
    [isRegisterLostMode]
  );
}
