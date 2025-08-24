import {
  Link,
  useLoaderData,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { StockStatus } from "@workspace/ui/components/stock-status";
import { HistoryTable } from "../components/history-table";
import { LocationSelect } from "../components/LocationSelect";
import { Button } from "@workspace/ui/components/button";
import { NotebookPen } from "lucide-react";
import { useEffect, useState } from "react";

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
  stockMovements?: Array<{
    id: string;
    type: string;
    quantity: number;
    quantity_before?: number | null;
    quantity_after?: number | null;
    created_at?: string;
    location?: {
      id: string;
      name: string;
    };
    user?: {
      id: string;
      name: string;
    };
  }>;
}

const formatQuantity = (quantity: number): string => {
  return parseFloat(quantity.toFixed(3)).toString();
};

export default function ProductPage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/_protected/products/$id" });
  const product = useLoaderData({
    from: "/_protected/products/$id",
  }) as ProductData;

  if (!product) {
    return <div>Loading...</div>;
  }

  const [selectedLocation, setSelectedLocation] = useState<string>("all");

  const getStockData = (): StockSummary => {
    if (product && product.quantities && product.quantities.length > 0) {
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
          quantity: parseFloat(qty.quantity.toFixed(3)),
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
      unit: product?.unit || "units",
      locations: [
        {
          locationId: "1",
          locationName: "Fridge",
          quantity: 2,
          unit: product?.unit || "units",
        },
        {
          locationId: "2",
          locationName: "Freezer",
          quantity: 3,
          unit: product?.unit || "units",
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

  useEffect(() => {
    if (stockData.locations.length === 1) {
      setSelectedLocation(stockData.locations[0].locationId);
    }
  }, [stockData.locations]);

  const historyData = product.stockMovements
    ? product.stockMovements
        .slice()
        .sort(
          (a, b) =>
            new Date(b.created_at || "").getTime() -
            new Date(a.created_at || "").getTime()
        )
        .slice(0, 6)
    : [];

  return (
    <div>
      <div className="p-6 flex flex-col gap-4 ">
        <div className="flex flex-col justify-center items-center">
          <img
            src="https://images.openfoodfacts.org/images/products/761/303/666/8910/front_fr.164.400.jpg"
            alt="Produit"
            className="aspect-square object-contain max-w-1/2 w-full"
          />
        </div>
        <div className="flex flex-col gap-1 ">
          <h2 className="text-2xl font-semibold">Nom du produit</h2>
          <p>Categorie : Aliments en conserve</p>
        </div>

        <div className="flex flex-col gap-4">
          <LocationSelect
            quantities={product.quantities || []}
            value={selectedLocation}
            onValueChange={setSelectedLocation}
            placeholder="Select a location"
            label="Available stock"
            unit={product?.unit || "units"}
            showAllOption={true}
            allOptionLabel="All locations"
            className="w-full"
          />

          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <p className="text-xl font-bold text-foreground">
                {formatQuantity(displayStock.quantity)}{" "}
                {product?.unit || "units"}
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                Available stock
              </p>
            </div>
            <StockStatus variant={displayStock.status} showLabel={false} />
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center gap-2 px-6 py-2">
        <h3 className="text-lg font-semibold">History :</h3>
        <Link
          to="/products/$id/history"
          params={{ id }}
          className="text-sm text-khp-primary underline underline-offset-2 cursor-pointer"
        >
          View all
        </Link>
      </div>
      <HistoryTable
        data={historyData}
        showHeader={false}
        unit={product?.unit || "units"}
      />
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
