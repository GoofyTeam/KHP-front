import {
  Link,
  useNavigate,
  useParams,
  useLoaderData,
} from "@tanstack/react-router";
import { StockStatus } from "@workspace/ui/components/stock-status";
import { HistoryTable, type HistoryEntry } from "../components/history-table";
import { Button } from "@workspace/ui/components/button";
import { NotebookPen } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface LocationStock {
  locationId: string;
  locationName: string;
  quantity: number;
  unit: string;
  locationType?: {
    id: string;
    name: string;
    is_default: boolean;
  };
}

interface StockSummary {
  totalQuantity: number;
  locations: LocationStock[];
  unit: string;
}

interface ProductData {
  id: string;
  name: string;
  unit: string;
  image_url?: string | null;
  categories: Array<{ name: string }>;
  quantities?: Array<{
    quantity: number;
    location: {
      id: string;
      name: string;
      locationType?: {
        id: string;
        name: string;
        is_default: boolean;
      };
    };
  }>;
}

export default function ProductPage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/_protected/products/$id" });
  const product = useLoaderData({
    from: "/_protected/products/$id",
  }) as ProductData;

  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  const getStockData = (): StockSummary => {
    if (product.quantities && product.quantities.length > 0) {
      const locationStocks: LocationStock[] = product.quantities.map(
        (qty: {
          quantity: number;
          location: {
            id: string;
            name: string;
            locationType?: {
              id: string;
              name: string;
              is_default: boolean;
            };
          };
        }) => ({
          locationId: qty.location.id,
          locationName: qty.location.name,
          quantity: qty.quantity,
          unit: product.unit,
          locationType: qty.location.locationType,
        })
      );

      return {
        totalQuantity: locationStocks.reduce(
          (total, loc) => total + loc.quantity,
          0
        ),
        unit: product.unit,
        locations: locationStocks,
      };
    }

    return {
      totalQuantity: 5,
      unit: product.unit,
      locations: [
        {
          locationId: "1",
          locationName: "Fridge",
          quantity: 2,
          unit: product.unit,
        },
        {
          locationId: "2",
          locationName: "Freezer",
          quantity: 3,
          unit: product.unit,
        },
      ],
    };
  };

  const stockData = getStockData();

  const getDisplayStock = (): {
    quantity: number;
    status: "in-stock" | "low-stock" | "out-of-stock";
  } => {
    if (selectedLocation === "all") {
      const totalQuantity = stockData.totalQuantity;
      return {
        quantity: totalQuantity,
        status:
          totalQuantity > 5
            ? "in-stock"
            : totalQuantity > 0
              ? "low-stock"
              : "out-of-stock",
      };
    } else {
      const location = stockData.locations.find(
        (loc) => loc.locationId === selectedLocation
      );
      if (!location) {
        return {
          quantity: 0,
          status: "out-of-stock",
        };
      }

      return {
        quantity: location.quantity,
        status:
          location.quantity > 5
            ? "in-stock"
            : location.quantity > 0
              ? "low-stock"
              : "out-of-stock",
      };
    }
  };

  const displayStock = getDisplayStock();

  useEffect(() => {
    if (product?.name) {
      document.title = `${product.name} - KHP`;
    }
    return () => {
      document.title = "KHP";
    };
  }, [product?.name]);

  // Auto-sélectionner la seule location disponible si il n'y en a qu'une
  useEffect(() => {
    if (stockData.locations.length === 1) {
      setSelectedLocation(stockData.locations[0].locationId);
    }
  }, [stockData.locations]);

  const historyData: HistoryEntry[] = [
    {
      id: "1",
      type: "add",
      quantity: 8.0,
      date: "24/09/2025",
    },
    {
      id: "2",
      type: "remove",
      quantity: 0.25,
      date: "12/09/2025",
    },
    {
      id: "3",
      type: "add",
      quantity: 8.0,
      date: "24/09/2025",
    },
    {
      id: "4",
      type: "add",
      quantity: 8.0,
      date: "24/09/2025",
    },
    {
      id: "5",
      type: "add",
      quantity: 8.0,
      date: "24/09/2025",
    },
    {
      id: "6",
      type: "add",
      quantity: 8.0,
      date: "24/09/2025",
    },
  ];

  if (!product) {
    return <div>Product not found</div>;
  }

  return (
    <div>
      <div className="p-6 flex flex-col gap-4 ">
        <div className="flex flex-col justify-center items-center">
          <img
            src={
              product.image_url ||
              "https://via.placeholder.com/400x400?text=No+Image"
            }
            alt={product.name}
            className="aspect-square object-contain max-w-1/2 w-full"
          />
        </div>
        <div className="flex flex-col gap-1 ">
          <h2 className="text-2xl font-semibold">{product.name}</h2>
          <p>
            Category:{" "}
            {product.categories
              .map((cat: { name: string }) => cat.name)
              .join(", ") || "Unspecified"}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {stockData.locations.length === 1 ? (
            <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-card-foreground">
                  {stockData.locations[0].locationName}
                </span>
                {stockData.locations[0].locationType && (
                  <span className="text-xs text-muted-foreground font-medium">
                    {stockData.locations[0].locationType.name}
                  </span>
                )}
              </div>
            </div>
          ) : stockData.locations.length > 1 ? (
            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              <SelectTrigger className="w-full h-auto py-3 px-4 rounded-lg border-border bg-card shadow-sm">
                <SelectValue placeholder="Sélectionner une localisation" />
              </SelectTrigger>
              <SelectContent className="rounded-lg border-border shadow-lg">
                <SelectItem value="all" className="py-2">
                  <span className="font-medium">Toutes les localisations</span>
                </SelectItem>
                {stockData.locations.map((location) => (
                  <SelectItem
                    key={location.locationId}
                    value={location.locationId}
                    className="py-2"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="font-medium">
                        {location.locationName}
                      </span>
                      {location.locationType && (
                        <span className="text-xs text-muted-foreground">
                          {location.locationType.name}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          <div className="flex justify-between items-center p-4">
            <div className="flex flex-col">
              <p className="text-xl font-bold text-foreground">
                {displayStock.quantity} {product.unit}
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                Stock disponible
              </p>
            </div>
            <StockStatus variant={displayStock.status} showLabel={false} />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-2 px-6 py-2">
        <h3 className="text-lg font-semibold">History:</h3>
        <Link
          to="/products/$id/history"
          params={{ id }}
          className="text-sm text-khp-primary underline underline-offset-2 cursor-pointer"
        >
          View all
        </Link>
      </div>
      <HistoryTable data={historyData} showHeader={false} />
      <div className="flex justify-center p-6">
        <Button
          variant="khp-default"
          className="pointer-events-auto "
          size="xl"
          onClick={() => {
            navigate({
              to: "/handle-item",
              search: {
                mode: "manual",
                type: "add",
              },
            });
          }}
        >
          <NotebookPen strokeWidth={2} className="text-white !h-5 !w-5" />{" "}
          <span className="text-xl">Edit product</span>
        </Button>
      </div>
    </div>
  );
}
