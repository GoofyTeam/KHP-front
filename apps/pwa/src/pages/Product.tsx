import {
  Link,
  useLoaderData,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import { useProduct } from "../stores/product-store";
import { StockStatus } from "@workspace/ui/components/stock-status";
import { HistoryTable } from "../components/history-table";
import { LocationSelect } from "../components/LocationSelect";
import { Button } from "@workspace/ui/components/button";
import { NotebookPen, Image } from "lucide-react";
import { useEffect, useState } from "react";
import { GetIngredientQuery } from "../graphql/getProduct.gql";

// Inférer les types depuis GraphQL
type ProductData = NonNullable<GetIngredientQuery["ingredient"]>;

const formatQuantity = (quantity: number): string => {
  return parseFloat(quantity.toFixed(3)).toString();
};

export default function ProductPage() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/_protected/products/$id" });
  const product = useLoaderData({
    from: "/_protected/products/$id",
  }) as ProductData;

  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const { setCurrentProduct } = useProduct();

  useEffect(() => {
    setCurrentProduct(product);

    return () => {
      setCurrentProduct(null);
    };
  }, [product, setCurrentProduct]);

  // Calcul direct du stock total
  const totalQuantity =
    product.quantities?.reduce((sum, qty) => sum + qty.quantity, 0) || 0;
  const locations = product.quantities || [];

  // Calcul direct du stock à afficher
  const displayStock = (() => {
    if (selectedLocation === "all") {
      return {
        quantity: totalQuantity,
        status:
          totalQuantity > 5
            ? "in-stock"
            : totalQuantity > 0
              ? "low-stock"
              : "out-of-stock",
      } as const;
    } else {
      const locationQty = locations.find(
        (qty) => qty.location.id === selectedLocation
      );
      if (!locationQty) {
        return {
          quantity: 0,
          status: "out-of-stock",
        } as const;
      }

      return {
        quantity: locationQty.quantity,
        status:
          locationQty.quantity > 5
            ? "in-stock"
            : locationQty.quantity > 0
              ? "low-stock"
              : "out-of-stock",
      } as const;
    }
  })();

  useEffect(() => {
    if (locations.length === 1) {
      setSelectedLocation(locations[0].location.id);
    }
  }, [locations]);

  if (!product) {
    navigate({
      to: "/inventory",
      replace: true,
    });
    return null;
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
          <LocationSelect
            quantities={product.quantities}
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
      <HistoryTable
        data={product.stockMovements || []}
        showHeader={false}
        unit={product.unit}
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
