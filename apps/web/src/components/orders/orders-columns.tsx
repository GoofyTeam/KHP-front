"use client";

import { GetOrdersQuery } from "@/graphql/generated/graphql";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@workspace/ui/components/badge";
import { OrdersDataTable } from "./orders-data-table";

export type Order = NonNullable<GetOrdersQuery["orders"]["data"]>[number];

const ordersColumns: ColumnDef<Order>[] = [
  {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;

      // Couleurs selon le statut
      let badgeClass = "bg-gray-100 text-gray-800";
      if (status === "PENDING") badgeClass = "bg-orange-100 text-orange-800";
      if (status === "SERVED") badgeClass = "bg-green-100 text-green-800";
      if (status === "PAYED") badgeClass = "bg-blue-100 text-blue-800";
      if (status === "CANCELED") badgeClass = "bg-red-100 text-red-800";

      return <Badge className={badgeClass}>{status}</Badge>;
    },
  },
  {
    header: "Table",
    accessorKey: "table.label",
    cell: ({ row }) => {
      const table = row.original.table;
      return table?.label || "-";
    },
  },
  {
    id: "menu_name",
    header: "Menu",
    cell: ({ row }) => {
      const order = row.original;
      // Récupère tous les noms de menus des étapes
      const menuNames =
        order.steps?.flatMap(
          (step) =>
            step.stepMenus
              ?.map((stepMenu) => stepMenu.menu?.name)
              .filter(Boolean) || []
        ) || [];

      // Affiche les noms uniques, séparés par des virgules
      const uniqueMenuNames = [...new Set(menuNames)];
      return uniqueMenuNames.length > 0 ? uniqueMenuNames.join(", ") : "-";
    },
  },
  {
    header: "Prix",
    accessorKey: "price",
    cell: ({ row }) => {
      const price = row.original.price;
      return price ? `${price.toFixed(2)}€` : "-";
    },
  },
];

export function OrdersTable() {
  return <OrdersDataTable columns={ordersColumns} />;
}
