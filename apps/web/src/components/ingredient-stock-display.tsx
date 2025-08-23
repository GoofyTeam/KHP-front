"use client";

import { useState, useEffect } from "react";
import { LocationSelector } from "./LocationSelect";
import type { Ingredient, IngredientQuantity } from "../types/stocks";
import { formatQuantity } from "../lib/formatQuantity";

interface IngredientStockDisplayProps {
  ingredient: Ingredient;
}

export function IngredientStockDisplay({
  ingredient,
}: IngredientStockDisplayProps) {
  const [selectedLocationIndex, setSelectedLocationIndex] =
    useState<string>("");

  // Auto-sélectionner la première location s'il n'y en a qu'une
  useEffect(() => {
    if (ingredient.quantities.length === 1) {
      setSelectedLocationIndex("0");
    }
  }, [ingredient.quantities.length]);

  const selectedQuantity = selectedLocationIndex
    ? ingredient.quantities[parseInt(selectedLocationIndex)]
    : null;

  const totalStock = ingredient.quantities.reduce(
    (sum: number, q: IngredientQuantity) => sum + q.quantity,
    0
  );

  const displayStock = selectedQuantity
    ? selectedQuantity.quantity
    : totalStock;
  const stockLabel = selectedQuantity
    ? `Stock - ${selectedQuantity.location.name}`
    : "Stock total";

  return (
    <>
      <div className="space-y-4 w-full lg:w-3/4 max-w-md">
        <div className="mb-4 ">
          <LocationSelector
            quantities={ingredient.quantities}
            value={selectedLocationIndex}
            onValueChange={setSelectedLocationIndex}
            placeholder="Choisir un emplacement"
            label="Emplacement"
          />
        </div>
        <div className="bg-khp-primary rounded-lg px-5 py-4 text-white">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-bold">
                {formatQuantity(displayStock)}
              </span>
              <span className="text-lg ml-2 opacity-90">{ingredient.unit}</span>
            </div>
            <span className="text-sm opacity-80">{stockLabel}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg px-4 py-3 border border-khp-border">
            <div className="text-xl font-semibold text-khp-primary">
              {ingredient.quantities.length}
            </div>
            <div className="text-sm text-khp-text-secondary">Emplacements</div>
          </div>

          <div className="bg-white rounded-lg px-4 py-3 border border-khp-border">
            <div className="text-xl font-semibold text-khp-primary">
              {formatQuantity(totalStock)}
              <span className="text-sm ml-1">{ingredient.unit}</span>
            </div>
            <div className="text-sm text-khp-text-secondary">Stock total</div>
          </div>
        </div>
      </div>
    </>
  );
}
