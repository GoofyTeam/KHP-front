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
          location: { id: string; name: string };
        }) => ({
          locationId: qty.location.id,
          locationName: qty.location.name,
          quantity: qty.quantity,
          unit: product.unit,
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
    locationText: string;
    status: "in-stock" | "low-stock" | "out-of-stock";
  } => {
    if (selectedLocation === "all") {
      const totalQuantity = stockData.totalQuantity;
      const locationCount = stockData.locations.length;

      return {
        quantity: totalQuantity,
        locationText: `in ${locationCount} location${locationCount > 1 ? "s" : ""}`,
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
          locationText: "location not found",
          status: "out-of-stock",
        };
      }

      return {
        quantity: location.quantity,
        locationText: `at ${location.locationName}`,
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

        <div className="flex flex-col gap-3">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {stockData.locations.map((location) => (
                <SelectItem
                  key={location.locationId}
                  value={location.locationId}
                >
                  {location.locationName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex justify-between gap-1 items-center">
            <div className="flex flex-col">
              <p className="text-lg font-semibold">
                Stock: {displayStock.quantity} {product.unit}
              </p>
              <p className="text-sm text-gray-600">
                {displayStock.locationText}
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
