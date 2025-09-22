"use client";

import { GetMenusQuery } from "@/graphql/generated/graphql";
import { ColumnDef } from "@tanstack/react-table";
import { StockStatus } from "@workspace/ui/components/stock-status";
import { Check, X } from "lucide-react";
import { getMenuServiceTypeLabel } from "@/constants/menu-service-type-labels";

export type Meals = NonNullable<GetMenusQuery["menus"]["data"]>[number];

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
  {
    id: "menu_type",
    header: "Menu Type",
    cell: ({ row }) => {
      const menuType = row.original.menu_type;
      if (menuType?.name) return menuType.name;
      const id = row.original.menu_type_id;
      return id ? String(id) : "—";
    },
    sortingFn: (a, b) => {
      const labelA =
        a.original.menu_type?.name ?? String(a.original.menu_type_id ?? "");
      const labelB =
        b.original.menu_type?.name ?? String(b.original.menu_type_id ?? "");
      return labelA.localeCompare(labelB);
    },
  },
  {
    accessorKey: "public_priority",
    header: "Priority",
    cell: ({ row }) =>
      typeof row.original.public_priority === "number"
        ? row.original.public_priority
        : "—",
    sortingFn: "basic",
  },
  {
    accessorKey: "service_type",
    header: "Service",
    cell: ({ row }) => getMenuServiceTypeLabel(row.original.service_type),
  },
  {
    accessorKey: "is_returnable",
    header: "Returnable?",
    cell: ({ row }) =>
      row.original.is_returnable ? (
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
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) =>
      typeof row.original.price === "number"
        ? `${row.original.price.toFixed(2)} €`
        : "—",
    sortingFn: "basic",
  },
  /*   {
    accessorKey: "category",
    header: "Category",
  }, */
  {
    accessorKey: "is_a_la_carte",
    header: 'Actually "a la carte" ?',
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
