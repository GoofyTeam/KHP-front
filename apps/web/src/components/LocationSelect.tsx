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
}

export function LocationSelector({
  quantities,
  value,
  onValueChange,
  placeholder = "Choose location",
  label = "Location",
  className = "",
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

  // Single location case
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

  // Multiple locations case
  return (
    <>
      <div className={`space-y-2 ${className}`}>
        <h3 className="text-base font-semibold text-khp-text-primary">
          {label}
        </h3>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {quantities.map((q, index: number) => (
              <SelectItem key={index} value={index.toString()}>
                <span className="font-medium">{q.location.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}
