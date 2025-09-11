"use client";

import { useQuery } from "@apollo/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

import { Loader2 } from "lucide-react";
import {
  GetLocationTypesDocument,
  type LocationType,
} from "@/graphql/generated/graphql";

interface LocationTypeSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  disabled?: boolean;
  showLabel?: boolean;
}

export function LocationTypeSelector({
  value,
  onValueChange,
  placeholder = "Choose location type",
  label = "Location Type",
  className = "",
  disabled = false,
  showLabel = true,
}: LocationTypeSelectorProps) {
  const { data, loading, error } = useQuery(GetLocationTypesDocument, {
    fetchPolicy: "cache-and-network",
    errorPolicy: "all",
  });

  const locationTypes = (data?.locationTypes?.data || []) as LocationType[];

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        {showLabel && (
          <h3 className="text-base font-semibold text-khp-text-primary">
            {label}
          </h3>
        )}
        <div className="flex items-center justify-center p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <Loader2 className="h-4 w-4 animate-spin text-khp-primary mr-2" />
          <span className="text-gray-500 text-sm">Loading types...</span>
        </div>
      </div>
    );
  }

  if (error || locationTypes.length === 0) {
    return (
      <div className={`space-y-2 ${className}`}>
        {showLabel && (
          <h3 className="text-base font-semibold text-khp-text-primary">
            {label}
          </h3>
        )}
        <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
          <span className="text-gray-500">
            {error ? "Error loading types" : "No location types available"}
          </span>
        </div>
      </div>
    );
  }

  // Sort by default first, then alphabetically
  const sortedTypes = [...locationTypes].sort((a, b) => {
    if (a.is_default && !b.is_default) return -1;
    if (!a.is_default && b.is_default) return 1;
    return a.name.localeCompare(b.name);
  });

  const selectedType = value
    ? locationTypes.find((type) => type.id === value)
    : null;

  return (
    <div className={`space-y-2 ${className}`}>
      {showLabel && (
        <h3 className="text-base font-semibold text-khp-text-primary">
          {label}
        </h3>
      )}
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all">
          {selectedType ? (
            <div className="flex items-center justify-between w-full">
              <span className="truncate max-w-[60%] font-medium">
                {selectedType.name}
              </span>
              {selectedType.is_default && (
                <span className="text-sm text-khp-text-secondary ml-2 flex-shrink-0">
                  Default
                </span>
              )}
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent className="max-h-72">
          {sortedTypes.map((type) => (
            <SelectItem
              key={type.id}
              value={type.id}
              className="!h-14 !min-h-14 !py-4 !px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors touch-manipulation"
            >
              <div className="flex flex-col w-full">
                <span className="font-medium text-khp-text-primary">
                  {type.name}
                </span>
                {type.is_default && (
                  <span className="text-sm text-khp-text-secondary mt-1">
                    Default
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
