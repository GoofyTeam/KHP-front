"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { GetIngredientQuery } from "../graphql/getProduct.gql";

const formatQuantity = (quantity: number): string => {
  return parseFloat(quantity.toFixed(3)).toString();
};

// Utiliser les types GraphQL générés
type IngredientQuantity = NonNullable<
  GetIngredientQuery["ingredient"]
>["quantities"][number];

interface LocationSelectorProps {
  quantities: IngredientQuantity[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  unit?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
}

export function LocationSelect({
  quantities,
  value,
  onValueChange,
  placeholder = "Choose location",
  label = "Location",
  className = "",
  unit = "",
  showAllOption = true,
  allOptionLabel = "All locations",
}: LocationSelectorProps) {
  if (!quantities || quantities.length === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        <h3 className="text-base font-semibold text-gray-900">{label}</h3>
        <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <span className="text-gray-500">No location available</span>
        </div>
      </div>
    );
  }

  if (quantities.length === 1 && !showAllOption) {
    return (
      <div className={`space-y-2 ${className}`}>
        <h3 className="text-base font-semibold text-gray-900">{label}</h3>
        <div className="p-4 bg-white border border-khp-primary rounded-lg">
          <span className="font-medium text-gray-900">
            {quantities[0].location.name}
          </span>
          {quantities[0].quantity > 0 && (
            <span className="text-sm text-gray-600 ml-2">
              {formatQuantity(quantities[0].quantity)} {unit}
            </span>
          )}
        </div>
      </div>
    );
  }

  // Find selected quantity based on location ID or "all"
  const selectedQuantity =
    value === "all" ? null : quantities.find((q) => q.location.id === value);

  // Calculate total stock across all locations
  const totalStock = parseFloat(
    quantities.reduce((sum, q) => sum + q.quantity, 0).toFixed(3)
  );

  // Remove duplicates by location ID, keeping the one with highest quantity
  const uniqueQuantities = quantities.reduce(
    (acc, current) => {
      const existing = acc.find(
        (item) => item.location.id === current.location.id
      );
      if (!existing) {
        acc.push(current);
      } else if (current.quantity > existing.quantity) {
        // Replace with the one that has higher quantity
        const index = acc.indexOf(existing);
        acc[index] = current;
      }
      return acc;
    },
    [] as typeof quantities
  );

  // Sort quantities: non-empty first, then empty, then by name
  const sortedQuantities = [...uniqueQuantities].sort((a, b) => {
    // First, sort by quantity (non-empty first)
    if (a.quantity > 0 && b.quantity === 0) return -1;
    if (a.quantity === 0 && b.quantity > 0) return 1;

    // Then sort by name alphabetically
    return a.location.name.localeCompare(b.location.name);
  });

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-base font-semibold text-gray-900">{label}</h3>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full min-h-[56px] text-base border-khp-primary focus:bg-khp-primary/10 transition-all touch-manipulation">
          {value === "all" ? (
            <div className="flex items-center justify-between w-full">
              <span className="truncate max-w-[60%] font-medium">
                {allOptionLabel}
              </span>
              {totalStock > 0 && (
                <span className="text-sm text-gray-600 ml-2 flex-shrink-0">
                  {formatQuantity(totalStock)} {unit}
                </span>
              )}
            </div>
          ) : selectedQuantity ? (
            <div className="flex items-center justify-between w-full">
              <span className="truncate max-w-[60%] font-medium">
                {selectedQuantity.location.name}
              </span>
              {selectedQuantity.quantity > 0 && (
                <span className="text-sm text-gray-600 ml-2 flex-shrink-0">
                  {formatQuantity(selectedQuantity.quantity)} {unit}
                </span>
              )}
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {showAllOption && (
            <SelectItem
              value="all"
              className="min-h-[56px] py-4 px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/20 transition-colors touch-manipulation"
            >
              <div className="flex flex-col w-full">
                <span className="font-medium text-gray-900">
                  {allOptionLabel}
                </span>
                {totalStock > 0 && (
                  <span className="text-sm text-gray-600 mt-1">
                    {formatQuantity(totalStock)} {unit} total
                  </span>
                )}
              </div>
            </SelectItem>
          )}
          {sortedQuantities.map((q) => (
            <SelectItem
              key={q.location.id}
              value={q.location.id}
              className="min-h-[56px] py-4 px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/20 transition-colors touch-manipulation"
            >
              <div className="flex flex-col w-full">
                <span className="font-medium text-gray-900">
                  {q.location.name}
                </span>
                <div className="flex items-center gap-2 mt-1">
                  {q.quantity > 0 && (
                    <span className="text-sm text-gray-600">
                      {formatQuantity(q.quantity)} {unit}
                    </span>
                  )}
                  {q.location.locationType?.is_default && (
                    <span className="text-xs bg-khp-primary/10 text-khp-primary px-2 py-0.5 rounded-full">
                      Default
                    </span>
                  )}
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
