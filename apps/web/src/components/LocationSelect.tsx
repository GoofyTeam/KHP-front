"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface Location {
  name: string;
}

interface IngredientQuantity {
  quantity: number;
  location: Location;
}

interface LocationSelectorProps {
  quantities: IngredientQuantity[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  unit?: string;
}

export function LocationSelector({
  quantities,
  value,
  onValueChange,
  placeholder = "Choose location",
  label = "Location",
  className = "",
  unit = "",
}: LocationSelectorProps) {
  if (!quantities || quantities.length === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        <h3 className="text-base font-semibold text-khp-text-primary">
          {label}
        </h3>
        <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <span className="text-gray-500">No location available</span>
        </div>
      </div>
    );
  }

  if (quantities.length === 1) {
    return (
      <div className={`space-y-2 ${className}`}>
        <h3 className="text-base font-semibold text-khp-text-primary">
          {label}
        </h3>
        <div className="p-4 bg-white border border-khp-primary rounded-lg">
          <span className="font-medium text-khp-text-primary">
            {quantities[0].location.name}
          </span>
        </div>
      </div>
    );
  }

  const selectedQuantity = value ? quantities[parseInt(value)] : null;

  return (
    <>
      <div className={`space-y-2 ${className}`}>
        <h3 className="text-base font-semibold text-khp-text-primary">
          {label}
        </h3>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all">
            {selectedQuantity ? (
              <div className="flex items-center justify-between w-full">
                <span className="truncate max-w-[60%] font-medium">
                  {selectedQuantity.location.name}
                </span>
                {selectedQuantity.quantity > 0 && (
                  <span className="text-sm text-khp-text-secondary ml-2 flex-shrink-0">
                    {selectedQuantity.quantity} {unit}
                  </span>
                )}
              </div>
            ) : (
              <SelectValue placeholder={placeholder} />
            )}
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {quantities.map((q, index: number) => (
              <SelectItem
                key={index}
                value={index.toString()}
                className="!h-14 !min-h-14 !py-4 !px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors touch-manipulation"
              >
                <div className="flex flex-col w-full">
                  <span className="font-medium text-khp-text-primary">
                    {q.location.name}
                  </span>
                  {q.quantity > 0 && (
                    <span className="text-sm text-khp-text-secondary mt-1">
                      {q.quantity} {unit}
                    </span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
