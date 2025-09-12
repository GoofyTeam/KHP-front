"use client";

import { GetMenusQuery } from "@/graphql/generated/graphql";
import { ColumnDef } from "@tanstack/react-table";
import { StockStatus } from "@workspace/ui/components/stock-status";
import { Check, X } from "lucide-react";

export type Meals = NonNullable<GetMenusQuery["menus"]>[number];

export const columns: ColumnDef<Meals>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "image_url",
    header: "Image",
    cell: ({ row }) =>
      row.original.image_url ? (
        <img
          src={row.original.image_url}
          alt={row.original.name}
          className="w-10 h-10 rounded object-cover"
        />
      ) : (
        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-500">
          N/A
        </div>
      ),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  /*   {
    accessorKey: "category",
    header: "Category",
  }, */
  {
    accessorKey: "is_a_la_carte",
    header: "Actually on the menu ?",
    cell: ({ row }) =>
      row.original.is_a_la_carte ? (
        <p className="text-green-600 flex items-center gap-1">
          <Check /> Yes
        </p>
      ) : (
        <p className="text-red-600 flex items-center gap-1">
          <X /> No
        </p>
      ),
    filterFn: (row, id, value) => {
      if (value === "all") return true;
      if (value === "true") return row.getValue(id) === true;
      if (value === "false") return row.getValue(id) === false;
      return true;
    },
  },
  {
    accessorKey: "available",
    header: "Meal available ?",
    cell: ({ row }) =>
      row.original.available ? (
        <StockStatus variant="in-stock" />
      ) : (
        <StockStatus variant="out-of-stock" />
      ),
    filterFn: (row, id, value) => {
      if (value === "all") return true;
      if (value === "true") return row.getValue(id) === true;
      if (value === "false") return row.getValue(id) === false;
      return true;
    },
  },
];
