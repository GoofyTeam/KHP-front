"use client";

import { GetMenuByIdQuery } from "@workspace/graphql";
import {
  convertMeasurement,
  type MeasurementUnitType,
} from "@workspace/ui/lib/measurement-units";
import { ColumnDef } from "@tanstack/react-table";

export type IngredientItem = NonNullable<
  GetMenuByIdQuery["menu"]
>["items"][number];

export const MealsIngredientColumns: ColumnDef<IngredientItem>[] = [
  {
    accessorKey: "entity.image_url",
    header: "Image",
    cell: ({ row }) =>
      row.original.entity.image_url ? (
        <img
          src={row.original.entity.image_url}
          alt={row.original.entity.name}
          className="w-10 h-10 rounded object-cover"
        />
      ) : (
        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-gray-500">
          N/A
        </div>
      ),
  },
  {
    accessorKey: "entity.name",
    header: "Name",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
    cell: ({ row }) => (
      <span>
        {row.original.quantity} {row.original.unit}
      </span>
    ),
  },
  {
    accessorKey: "location.name",
    header: "Location",
  },
  {
    header: "Quantity in location",
    cell: ({ row }) => {
      const quantityForSelectedLocation = row.original.entity.quantities.find(
        (q) => q.location.id === row.original.location.id
      );

      return (
        <span>
          {quantityForSelectedLocation
            ? `${quantityForSelectedLocation.quantity} ${row.original.entity.unit}`
            : "N/A"}
        </span>
      );
    },
  },
  {
    header: "Quantity needed ?",
    cell: ({ row }) => {
      const quantityForSelectedLocation = row.original.entity.quantities.find(
        (q) => q.location.id === row.original.location.id
      );

      const neededQty = row.original.quantity;
      const neededUnit = row.original.unit as unknown as MeasurementUnitType; // cast UnitEnum -> MeasurementUnitType

      if (!quantityForSelectedLocation) {
        return (
          <span className="text-red-500">
            Missing {neededQty} {neededUnit}
          </span>
        );
      }

      const availableQty = quantityForSelectedLocation.quantity;
      const availableUnit = row.original.entity.unit as unknown as MeasurementUnitType;

      const availableInNeededUnit = convertMeasurement(
        availableQty,
        availableUnit,
        neededUnit
      );

      if (availableInNeededUnit == null) {
        return (
          <span className="text-yellow-600">Incompatible units for comparison</span>
        );
      }

      if (availableInNeededUnit >= neededQty) {
        return <span className="text-green-500">Sufficient</span>;
      }

      const missing = Math.max(0, neededQty - availableInNeededUnit);
      const formattedMissing = Number.isFinite(missing)
        ? missing.toFixed(2)
        : String(missing);

      return (
        <span className="text-red-500">
          Missing {formattedMissing} {neededUnit}
        </span>
      );
    },
  },
];
