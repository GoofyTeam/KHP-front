"use client";

import { GetPreparationsQuery } from "@/graphql/generated/graphql";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@workspace/ui/components/badge";
import { Package } from "lucide-react";
import { PreparationDataTable } from "./preparation-data-table";

export type Preparation = NonNullable<
  GetPreparationsQuery["preparations"]["data"]
>[number];

const preparationColumns: ColumnDef<Preparation>[] = [
  {
    header: "ID",
    accessorKey: "id",
  },
  {
    header: "Preparation Name",
    accessorKey: "name",
    cell: ({ row }) => {
      const preparation = row.original;

      return (
        <div className="flex items-center space-x-3">
          {preparation.image_url ? (
            <img
              src={preparation.image_url}
              alt={preparation.name}
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
            title={preparation.name}
          >
            {preparation.name}
          </div>
        </div>
      );
    },
  },
  {
    header: "Quantity",
    accessorKey: "quantity",
    cell: ({ row }) => {
      const quantities = row.original.quantities;
      let quantity = 0;
      if (quantities && quantities.length > 0) {
        quantity = quantities.reduce((acc, curr) => acc + curr.quantity, 0);
      }
      return <div className="text-left">{quantity}</div>;
    },
  },
  {
    header: "Storage Unit",
    accessorKey: "unit",
  },
  {
    header: "Category",
    accessorKey: "category",
    cell: ({ row }) => {
      const categories = row.original.categories;

      if (categories && categories.length <= 0) {
        return <Badge className="bg-muted text-muted-foreground">None</Badge>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {categories?.map((category) => (
            <Badge key={category.id} className="bg-muted text-muted-foreground">
              {category.name}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    header: "Actions",
    accessorKey: "actions",
    cell: () => {
      return <div className="text-center">...</div>;
    },
  },
];

export function PreparationsTable() {
  return <PreparationDataTable columns={preparationColumns} />;
}
