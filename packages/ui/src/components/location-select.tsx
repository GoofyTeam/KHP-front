"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import { useMemo } from "react";

export interface LocationItem {
  id: string;
  name: string;
  locationType?: { is_default?: boolean; name: string } | null;
}

interface IngredientQuantity {
  quantity: number;
  location: LocationItem;
}

interface IngredientsForLocationSelect {
  id: string;
  name: string;
  quantities: IngredientQuantity[] | null | undefined;
}

export interface LocationsFromCompany {
  name: string;
  id: string;
}

interface LocationSelectProps {
  quantities: IngredientQuantity[] | null | undefined;
  value?: string; // "all" | location.id
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  unit?: string;
  parentClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
  hideEmptyLocations?: boolean;
  showAllOption?: boolean;
  allOptionLabel?: string;
  displayAllQuantity?: boolean;
}

const formatQuantity = (q: number) => parseFloat(q.toFixed(3)).toString();

export const locationSelectMapper = (
  q: LocationsFromCompany[] | IngredientsForLocationSelect
) => {
  if (!Array.isArray(q)) return [];

  return q.map((loc) => ({
    location: {
      id: loc.id,
      name: loc.name,
      locationType: null,
    },
    quantity: 0,
  }));
};

export function LocationSelect({
  quantities,
  value,
  onValueChange,
  placeholder = "Choose location",
  label = "Location",
  unit = "",
  parentClassName = "",
  triggerClassName = "",
  contentClassName = "",
  hideEmptyLocations = false,
  showAllOption = true,
  allOptionLabel = "All locations",
  displayAllQuantity = false,
}: LocationSelectProps) {
  // --- Derived data (memo) -------------------------------------------------
  const { list, total, byId } = useMemo(() => {
    // 1) dédoublonne par location.id (garde la quantité la + haute)
    const map = new Map<string, IngredientQuantity>();
    for (const q of quantities!) {
      const id = q.location.id;
      const prev = map.get(id);
      if (!prev || q.quantity > prev.quantity) map.set(id, q);
    }

    // 2) option pour masquer les emplacements vides
    let arr = Array.from(map.values());
    if (hideEmptyLocations) arr = arr.filter((q) => q.quantity > 0);

    // 3) tri: non-vides d’abord, puis alphabétique par nom
    arr.sort((a, b) => {
      if (a.quantity > 0 && b.quantity === 0) return -1;
      if (a.quantity === 0 && b.quantity > 0) return 1;
      return a.location.name.localeCompare(b.location.name);
    });

    // 4) total
    const total = parseFloat(
      arr.reduce((s, q) => s + q.quantity, 0).toFixed(3)
    );

    // 5) accès direct par id
    const byId = new Map(arr.map((q) => [q.location.id, q]));

    return { list: arr, total, byId };
  }, [quantities, hideEmptyLocations]);

  // --- Guards --------------------------------------------------------------
  const hasInput = Array.isArray(quantities) && quantities.length > 0;

  if (!hasInput) {
    return (
      <div className={cn("space-y-2", parentClassName)}>
        <h3 className="text-base font-semibold text-khp-text-primary">
          {label}
        </h3>
        <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <span className="text-gray-500">No location available</span>
        </div>
      </div>
    );
  }

  // Après filtrage: plus rien à afficher
  if (list.length === 0) {
    return (
      <div className={cn("space-y-2", parentClassName)}>
        <h3 className="text-base font-semibold text-khp-text-primary">
          {label}
        </h3>
        <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <span className="text-gray-500">No location available</span>
        </div>
      </div>
    );
  }

  // Cas simple: une seule localisation et pas d’option "All"
  if (list.length === 1 && !showAllOption) {
    const only = list[0];
    if (!only) return null;

    return (
      <div className={cn("space-y-2", parentClassName)}>
        <h3 className="text-base font-semibold text-gray-900">{label}</h3>
        <div className="p-4 bg-white border border-khp-primary rounded-lg">
          <span className="font-medium text-gray-900">
            {only.location.name}
          </span>
          {only.quantity > 0 && (
            <span className="text-sm text-gray-600 ml-2">
              {formatQuantity(only.quantity)} {unit}
            </span>
          )}
        </div>
      </div>
    );
  }

  // --- Sélection courante --------------------------------------------------
  const isAll = value === "all";
  const selected = !isAll && value ? byId.get(value) : undefined;

  // --- UI ------------------------------------------------------------------
  return (
    <div className={cn("space-y-2", parentClassName)}>
      <h3 className="text-base font-semibold text-khp-text-primary">{label}</h3>

      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={cn(
            "w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all",
            triggerClassName
          )}
        >
          {isAll ? (
            <div className="flex items-center justify-between w-full">
              <span className="truncate max-w-[60%] font-medium">
                {allOptionLabel}
              </span>
              {total > 0 && (
                <span className="text-sm text-gray-600 ml-2 flex-shrink-0">
                  {formatQuantity(total)} {unit}
                </span>
              )}
            </div>
          ) : selected ? (
            <div className="flex items-center justify-between w-full">
              <p className="truncate max-w-[60%] font-medium">
                {selected.location.name}
              </p>
              {selected.quantity > 0 ? (
                <p className="text-sm text-khp-text-secondary ml-2 flex-shrink-0">
                  {formatQuantity(selected.quantity)} {unit}
                </p>
              ) : (
                displayAllQuantity && (
                  <p className="text-sm text-gray-600 ml-2 flex-shrink-0">
                    {formatQuantity(
                      selected.quantity > 0 ? selected.quantity : 0
                    )}{" "}
                    {unit}
                  </p>
                )
              )}
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>

        <SelectContent className={cn("max-h-72", contentClassName)}>
          {showAllOption && (
            <SelectItem
              value="all"
              className="min-h-[56px] py-4 px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/20 transition-colors touch-manipulation"
            >
              <div className="flex flex-col w-full">
                <span className="font-medium text-gray-900">
                  {allOptionLabel}
                </span>
                {total > 0 && (
                  <span className="text-sm text-gray-600 mt-1">
                    {formatQuantity(total)} {unit} total
                  </span>
                )}
              </div>
            </SelectItem>
          )}

          {list.map((q) => (
            <SelectItem
              key={q.location.id}
              value={q.location.id}
              className="min-h-[56px] py-4 px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/20 transition-colors touch-manipulation"
            >
              <div className="flex flex-col w-full">
                <p className="font-medium text-gray-900">{q.location.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  {q.quantity > 0 && (
                    <p className="text-sm text-gray-600">
                      {formatQuantity(q.quantity)} {unit}
                    </p>
                  )}
                  {q.location.locationType?.is_default && (
                    <p className="text-xs bg-khp-primary/10 text-khp-primary px-2 py-0.5 rounded-full">
                      Default
                    </p>
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
