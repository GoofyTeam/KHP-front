"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Package } from "lucide-react";
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

export const columns: ColumnDef<Ingredient>[] = [
  {
    accessorKey: "name",
    header: "Product name",
    cell: ({ row }) => {
      const ingredient = row.original;
      return (
        <div className="flex items-center space-x-3">
          {ingredient.image_url ? (
            <img
              src={ingredient.image_url}
              alt={ingredient.name}
              className="h-10 w-10 rounded-md object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
              <Package className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
          <div>
            <div className="font-medium">{ingredient.name}</div>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const ingredient = row.original;
      if (!value) return true;
      return ingredient.name.toLowerCase().includes(value.toLowerCase());
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
      return <div className="font-medium">{totalQuantity.toFixed(1)}</div>;
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
        <div className="flex flex-wrap gap-1">
          {ingredient.categories.slice(0, 2).map((category) => (
            <span
              key={category.id}
              className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs font-medium"
            >
              {category.name}
            </span>
          ))}
          {ingredient.categories.length > 2 && (
            <span className="text-xs text-muted-foreground">
              +{ingredient.categories.length - 2}
            </span>
          )}
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const ingredient = row.original;
      if (!value || (Array.isArray(value) && value.length === 0)) return true;

      // Handle array of values (multi-select)
      if (Array.isArray(value)) {
        return value.some((filterValue) =>
          ingredient.categories.some((category) =>
            category.name.toLowerCase().includes(filterValue.toLowerCase())
          )
        );
      }

      // Handle single value (legacy)
      if (value === "all") return true;
      return ingredient.categories.some((category) =>
        category.name.toLowerCase().includes(value.toLowerCase())
      );
    },
  },
  {
    id: "expiry_date",
    header: "Expiry date",
    cell: () => {
      // Mock expiry date for now - you can replace this with real data
      const mockDate = new Date();
      mockDate.setDate(mockDate.getDate() + Math.floor(Math.random() * 30));
      return (
        <div className="text-sm">{mockDate.toLocaleDateString("fr-FR")}</div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const ingredient = row.original;
      const status = getStockStatus(ingredient.quantities);
      return <StockStatus variant={status} showLabel />;
    },
    filterFn: (row, id, value) => {
      const ingredient = row.original;
      if (!value || (Array.isArray(value) && value.length === 0)) return true;

      const status = getStockStatus(ingredient.quantities);

      // Handle array of values (multi-select)
      if (Array.isArray(value)) {
        return value.includes(status);
      }

      // Handle single value (legacy)
      if (value === "all") return true;
      return status === value;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const ingredient = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
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
];
