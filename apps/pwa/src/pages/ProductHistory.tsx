import { useLoaderData, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, useEffect, useMemo } from "react";
import { HistoryTable } from "../components/history-table";
import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Filter, X, Loader2 } from "lucide-react";
import { GetProductQuery } from "../graphql/getProduct.gql";
import { LocationSelect } from "@workspace/ui/components/location-select";

interface ProductData {
  id: string;
  name: string;
  unit: string;
}

type StockMovement = NonNullable<
  GetProductQuery["ingredient"]
>["stockMovements"][number];

interface LoaderData {
  product: ProductData;
  stockMovements: StockMovement[];
  paginatorInfo: {
    hasMorePages: boolean;
    currentPage: number;
    total: number;
    count: number;
  };
  currentFilter: string;
  currentSelectedMonth?: string;
}

type FilterPreset = "all" | "today" | "week" | "month";

export default function ProductHistoryPage() {
  const loaderData = useLoaderData({
    from: "/_protected/products/$id_/history",
  }) as LoaderData;

  const navigate = useNavigate();

  const [showFilters, setShowFilters] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");

  const {
    product,
    stockMovements,
    paginatorInfo,
    currentFilter,
    currentSelectedMonth,
  } = loaderData;

  console.log("🎯 ProductHistory data:", {
    product,
    stockMovements,
    paginatorInfo,
    currentFilter,
  });

  const availableLocations = useMemo(() => {
    const locationsMap = new Map();
    stockMovements.forEach((movement) => {
      if (movement.location) {
        locationsMap.set(movement.location.id, movement.location);
      }
    });
    const locations = Array.from(locationsMap.values());

    return locations;
  }, [stockMovements]);

  const locationQuantities = useMemo(() => {
    return availableLocations.map((location) => ({
      quantity: stockMovements.filter((m) => m.location?.id === location.id)
        .length,
      location: location,
    }));
  }, [availableLocations, stockMovements]);

  const filteredMovements = useMemo(() => {
    if (!selectedLocationId || selectedLocationId === "all") {
      return stockMovements;
    }

    return stockMovements.filter(
      (movement) => movement.location?.id === selectedLocationId
    );
  }, [stockMovements, selectedLocationId]);

  const getAvailableMonths = useCallback(async () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        label: date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
        }),
      });
    }
    return months;
  }, []);

  const [availableMonths, setAvailableMonths] = useState<
    Array<{ key: string; label: string }>
  >([]);

  useEffect(() => {
    getAvailableMonths().then(setAvailableMonths);
  }, [getAvailableMonths]);

  const handleFilterChange = useCallback(
    async (newFilter: FilterPreset, newSelectedMonth?: string) => {
      setIsNavigating(true);

      const searchParams: { filter: FilterPreset; selectedMonth?: string } = {
        filter: newFilter,
      };

      if (
        newFilter === "month" &&
        newSelectedMonth &&
        newSelectedMonth !== "all"
      ) {
        searchParams.selectedMonth = newSelectedMonth;
      }

      try {
        await navigate({
          to: ".",
          search: searchParams,
        });
      } finally {
        setIsNavigating(false);
      }
    },
    [navigate]
  );

  const handlePresetChange = (preset: FilterPreset) => {
    handleFilterChange(preset);
  };

  const handleMonthChange = (month: string) => {
    handleFilterChange("month", month);
  };

  const clearFilters = () => {
    setSelectedLocationId("all");
    handleFilterChange("all");
  };

  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId);
  };

  return (
    <div className="pb-20">
      <div className="sticky top-16 z-90 flex flex-col gap-4 p-2 bg-khp-background">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">{product.name}</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
            disabled={isNavigating}
          >
            {isNavigating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Filter className="h-4 w-4" />
            )}
            Filters
          </Button>
        </div>

        {showFilters && (
          <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Filter by Date
              </h3>
              {(currentFilter !== "all" || selectedLocationId !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="flex items-center gap-1 h-6 px-2 text-xs"
                  disabled={isNavigating}
                >
                  <X className="h-3 w-3" />
                  Clear
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: "all", label: "All time" },
                { key: "today", label: "Today" },
                { key: "week", label: "This week" },
                { key: "month", label: "By month" },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={currentFilter === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePresetChange(key as FilterPreset)}
                  className="text-xs"
                  disabled={isNavigating}
                >
                  {label}
                </Button>
              ))}
            </div>

            {currentFilter === "month" && availableMonths.length > 0 && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">
                    Select Month
                  </label>
                  <Select
                    value={currentSelectedMonth || "all"}
                    onValueChange={handleMonthChange}
                    disabled={isNavigating}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a month" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All months</SelectItem>
                      {availableMonths.map(({ key, label }) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Location Filter */}
            {locationQuantities.length > 0 && (
              <div className="border-t pt-4">
                <LocationSelect
                  quantities={locationQuantities}
                  value={selectedLocationId}
                  onValueChange={handleLocationChange}
                  placeholder="Select location"
                  label="Locations"
                  unit={product.unit}
                  hideEmptyLocations={false}
                  showAllOption={true}
                  allOptionLabel="All locations"
                  displayAllQuantity={true}
                />
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Showing {filteredMovements.length} of {stockMovements.length}{" "}
              movements
              {paginatorInfo.total > stockMovements.length && (
                <span> of {paginatorInfo.total} total</span>
              )}
              {isNavigating && (
                <span className="ml-2 text-muted-foreground/70">
                  <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                  Loading...
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="m-2">
        <HistoryTable
          data={filteredMovements}
          showHeader={true}
          limitHeight={false}
          unit={product.unit}
        />
      </div>
    </div>
  );
}
