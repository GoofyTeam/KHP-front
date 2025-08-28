import { Link, useLoaderData, useParams } from "@tanstack/react-router";
import { Helmet } from "react-helmet-async";
import { useProduct } from "../stores/product-store";
import { StockStatus } from "@workspace/ui/components/stock-status";
import { HistoryTable } from "../components/history-table";
import { LocationSelect } from "../components/LocationSelect";
import { Button } from "@workspace/ui/components/button";
import { NotebookPen } from "lucide-react";
import { useEffect, useState } from "react";
import { GetIngredientQuery } from "../graphql/getProduct.gql";
import { ImagePlaceholder } from "../components/ImagePlaceholder";

// Inférer les types depuis GraphQL
type ProductData = NonNullable<GetIngredientQuery["ingredient"]>;

const formatQuantity = (quantity: number): string => {
  return parseFloat(quantity.toFixed(3)).toString();
};

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

  return (
    <>
      <Helmet>
        <title>{product?.name || "Product"} - KHP</title>
      </Helmet>
      <div>
        <div className="p-6 flex flex-col gap-4 ">
          <div className="flex flex-col justify-center items-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="aspect-square object-contain max-w-1/2 w-full"
              />
            ) : (
              <ImagePlaceholder className="max-w-1/2 w-full" />
            )}
          </div>
          <div className="flex flex-col gap-1 ">
            <h2 className="text-2xl font-semibold">{product.name}</h2>
            <p>
              Category:{" "}
              {product.categories
                ?.map((cat: { name: string }) => cat.name)
                .join(", ") || "Unspecified"}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <LocationSelect
              quantities={product.quantities || []}
              value={selectedLocation}
              onValueChange={setSelectedLocation}
              placeholder="Select a location"
              label="Available stock"
              unit={product.unit}
              showAllOption={true}
              allOptionLabel="All locations"
              className="w-full"
            />

            <div className="flex justify-between items-center p-4">
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
        <HistoryTable
          data={product.stockMovements || []}
          showHeader={false}
          unit={product.unit}
        />
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
