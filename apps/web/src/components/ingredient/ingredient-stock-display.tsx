"use client";

import { useState, useEffect, useMemo } from "react";
import { LocationSelect } from "@workspace/ui/components/location-select";
import { formatQuantity } from "../../lib/formatQuantity";
import {
  GetIngredientQuery,
  GetPreparationByIdQuery,
} from "@/graphql/generated/graphql";

type IngredientData = NonNullable<GetIngredientQuery["ingredient"]>;
type PreparationData = NonNullable<GetPreparationByIdQuery["preparation"]>;
type StockQuantity = {
  quantity: number;
  location: {
    id: string;
    name: string;
  };
};

type IngredientStockDisplayProps =
  | { ingredient: IngredientData; preparation?: never }
  | { ingredient?: never; preparation: PreparationData };

export function IngredientStockDisplay({ ingredient, preparation }: IngredientStockDisplayProps) {
  const stockTarget = ingredient ?? preparation;
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");

  const quantities = useMemo(() => {
    return ((stockTarget?.quantities ?? []) as StockQuantity[]).slice();
  }, [stockTarget]);

  // Sync selection when available locations change so the UI always reflects the
  // current dataset (single location -> auto select, otherwise default to "all").
  useEffect(() => {
    if (quantities.length === 1) {
      const onlyLocationId = quantities[0]?.location.id ?? "all";
      setSelectedLocationId((prev) =>
        prev === onlyLocationId ? prev : onlyLocationId
      );
      return;
    }

    setSelectedLocationId((prev) =>
      prev === "all" || !quantities.some((q) => q.location.id === prev)
        ? "all"
        : prev
    );
  }, [quantities]);

  const isAllSelected = selectedLocationId === "all";
  const selectedQuantity = isAllSelected
    ? undefined
    : quantities.find((q) => q.location.id === selectedLocationId);

  if (!stockTarget) {
    return null;
  }

  const totalStock = quantities.reduce((sum: number, q: StockQuantity) => {
    return sum + q.quantity;
  }, 0);

  const displayStock = isAllSelected
    ? totalStock
    : selectedQuantity?.quantity ?? 0;
  const stockLabel = isAllSelected
    ? "Stock total"
    : `Stock - ${selectedQuantity?.location.name ?? ""}`;

  return (
    <>
      <div className="space-y-4 w-full">
        <div className="mb-4 ">
          <LocationSelect
            quantities={quantities}
            value={selectedLocationId}
            onValueChange={setSelectedLocationId}
            placeholder="Select location"
            label="Locations"
            unit={stockTarget.unit}
            hideEmptyLocations={false}
            showAllOption={true}
            allOptionLabel="All locations"
            displayAllQuantity={true}
          />
        </div>
        <div className="bg-khp-primary rounded-lg px-5 py-4 text-white">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-bold">
                {formatQuantity(displayStock)}
              </span>
              <span className="text-lg ml-2 opacity-90">{stockTarget.unit}</span>
            </div>
            <span className="text-sm opacity-80">{stockLabel}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg px-4 py-3 border border-khp-border">
            <div className="text-xl font-semibold text-khp-primary">
              {quantities.length}
            </div>
            <div className="text-sm text-khp-text-secondary">Locations</div>
          </div>

          <div className="bg-white rounded-lg px-4 py-3 border border-khp-border">
            <div className="text-xl font-semibold text-khp-primary">
              {formatQuantity(totalStock)}
              <span className="text-sm ml-1">{stockTarget.unit}</span>
            </div>
            <div className="text-sm text-khp-text-secondary">Total stock</div>
          </div>
        </div>
      </div>
    </>
  );
}
