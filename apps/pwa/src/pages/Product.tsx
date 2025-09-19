import { Link, useLoaderData, useParams } from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import { useProduct } from "../stores/product-store";
import { StockStatus } from "@workspace/ui/components/stock-status";
import { MovementHistory } from "@workspace/ui/components/movement-history";
import { movementHistoryFromStockMovements } from "@workspace/ui/lib/movement-history";
import { Button } from "@workspace/ui/components/button";
import {
  ArrowRightLeft,
  NotebookPen,
  Package,
  PackageMinus,
  PackagePlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { GetProductQuery } from "../graphql/getProduct.gql";
import { LocationSelect } from "@workspace/ui/components/location-select";
import { ImagePlaceholder } from "@workspace/ui/components/image-placeholder";

// Inférer les types depuis GraphQL
type ProductData = NonNullable<GetProductQuery["ingredient"]>;

const formatQuantity = (quantity: number): string => {
  return parseFloat(quantity.toFixed(3)).toString();
};

const defaultHistoryScrollClass =
  "max-h-[40vh] [@media(min-height:600px)]:max-h-[45vh] [@media(min-height:700px)]:max-h-[50vh] [@media(min-height:800px)]:max-h-[55vh] overflow-y-auto";

export default function ProductPage() {
  const { id } = useParams({ from: "/_protected/products/$id" });
  const loaderData = useLoaderData({
    from: "/_protected/products/$id",
  }) as { data: ProductData; meta: unknown };

  const product = loaderData?.data;

  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const { setCurrentProduct } = useProduct();

  useEffect(() => {
    setCurrentProduct(product);

    return () => {
      setCurrentProduct(null);
    };
  }, [product, setCurrentProduct]);

  const uniqueQuantities = (product?.quantities || []).reduce(
    (acc, current) => {
      const existing = acc.find(
        (item) => item.location.id === current.location.id
      );
      if (!existing) {
        acc.push(current);
      } else if (current.quantity > existing.quantity) {
        const index = acc.indexOf(existing);
        acc[index] = current;
      }
      return acc;
    },
    [] as NonNullable<typeof product.quantities>
  );

  const totalQuantity = uniqueQuantities.reduce(
    (sum, qty) => sum + qty.quantity,
    0
  );
  const locations = uniqueQuantities;

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
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-lg">Loading product...</p>
          <p className="text-sm text-gray-500 mt-2">
            ID: {id} | Data: {loaderData ? "Present" : "Missing"}
          </p>
        </div>
      </div>
    );
  }

  const allStockMovements = product.stockMovements ?? [];
  const recentStockMovements = [...allStockMovements]
    .sort((a, b) => {
      const dateA = a?.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b?.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  return (
    <>
      <Helmet>
        <title>{product?.name || "Product"} - KHP</title>
      </Helmet>
      <div className="p-6 flex flex-col gap-4 ">
        <div className="flex flex-col justify-center items-center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="aspect-square object-cover max-w-1/2 w-full my-6 rounded-md"
            />
          ) : (
            <ImagePlaceholder className="max-w-1/2 w-full" />
          )}
        </div>
        <div className="flex flex-col gap-1 ">
          <h2 className="text-2xl font-semibold">{product.name}</h2>
          <p>Category: {product.category?.name || "Uncategorized"}</p>

          {/* Affichage des informations de base pour les ingrédients */}
          {product && product.base_quantity && product.base_unit && (
            <div className="flex items-center justify-center gap-4 text-sm mt-2">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Base:</span>
                <span className="font-medium text-foreground">
                  {formatQuantity(product.base_quantity)}
                </span>
              </div>
              <div className="w-px h-4 bg-border"></div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Unit:</span>
                <span className="font-medium text-foreground">
                  {product.base_unit}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <LocationSelect
            quantities={product.quantities || []}
            value={selectedLocation}
            onValueChange={(val) => setSelectedLocation(val)}
            placeholder="Select location"
            label="Locations"
            unit={product.unit}
            hideEmptyLocations={false}
            showAllOption={true}
            allOptionLabel="All locations"
            displayAllQuantity={true}
          />

          <div className="flex justify-between items-center py-4">
            <div className="flex flex-col">
              <p className="text-xl font-bold text-foreground">
                {formatQuantity(displayStock.quantity)} {product.unit}
              </p>
              <p className="text-sm text-muted-foreground font-medium">
                Stock disponible
              </p>
            </div>
            <StockStatus variant={displayStock.status} showLabel={false} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-x-1">
          <Button
            variant="khp-default"
            className="pointer-events-auto w-full"
            size="lg"
            asChild
          >
            <Link
              to="/handle-item"
              search={{
                mode: "internalId",
                type: "add-quantity",
                scanMode: "stock-mode",
                internalId: id,
              }}
            >
              <PackagePlus
                strokeWidth={1.5}
                size={128}
                className="text-white !h-8 !w-8"
              />
            </Link>
          </Button>
          <Button
            variant="khp-outline"
            className="pointer-events-auto w-full"
            size="lg"
            asChild
          >
            <Link to="/move-quantity" search={{ internalId: id }}>
              <span className="flex items-center">
                <Package
                  strokeWidth={1.5}
                  size={128}
                  className="text-khp-primary !h-8 !w-8"
                />
                <ArrowRightLeft
                  strokeWidth={1.5}
                  size={64}
                  className="text-khp-primary !h-8 !w-8"
                />
                <Package
                  strokeWidth={1.5}
                  size={128}
                  className="text-khp-primary !h-8 !w-8"
                />
              </span>
            </Link>
          </Button>
          <Button
            variant="khp-destructive"
            className="pointer-events-auto w-full"
            size="lg"
            asChild
          >
            <Link
              to="/handle-item"
              search={{
                mode: "internalId",
                type: "remove-quantity",
                scanMode: "remove-mode",
                internalId: id,
              }}
            >
              <PackageMinus
                strokeWidth={1.5}
                size={128}
                className="text-white !h-8 !w-8"
              />
            </Link>
          </Button>
        </div>

        <div>
          <div className="flex justify-between items-center gap-2 py-2">
            <h3 className="text-lg font-semibold">History:</h3>
            <Link
              to="/products/$id/history"
              params={{ id }}
              className="text-sm text-khp-primary underline underline-offset-2 cursor-pointer"
            >
              View all
            </Link>
          </div>
          <MovementHistory
            entries={movementHistoryFromStockMovements(
              recentStockMovements,
              product.unit
            )}
            showHeader={false}
            defaultUnit={product.unit}
            scrollContainerClassName={defaultHistoryScrollClass}
          />
        </div>
        <div className="flex justify-center p-6">
          <Button
            variant="khp-default"
            className="pointer-events-auto"
            size="xl"
            asChild
          >
            <Link
              to="/handle-item"
              search={{
                type: "update-product",
                internalId: id,
                mode: "internalId",
                scanMode: "stock-mode",
              }}
            >
              <NotebookPen strokeWidth={2} className="text-white !h-5 !w-5" />{" "}
              <span className="text-xl">Edit product</span>
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
