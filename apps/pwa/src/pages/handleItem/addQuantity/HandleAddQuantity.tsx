import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";
import { useForm } from "react-hook-form";
import z from "zod";
import { handleAddQuantitySchema } from "./handleAddQuantitySchema";
import { useLoaderData, useNavigate, useSearch } from "@tanstack/react-router";
import { LocationSelect } from "@workspace/ui/components/location-select";
import { QuantityInput } from "@workspace/ui/components/quantity-input";
import { Button } from "@workspace/ui/components/button";
import { router } from "../../../main";
import { addQuantitySubmit } from "./add-quantity";
import { cn } from "@workspace/ui/lib/utils";
import {
  GetLocations,
  type GetLocationsQuery,
} from "../../../graphql/getLocations.gql";
import { gqlClient } from "../../../lib/graph-client";

function HandleAddQuantity() {
  const navigate = useNavigate();
  const { internalId, barcode, mode, scanMode } = useSearch({
    from: "/_protected/handle-item",
  });
  const { product, type } = useLoaderData({
    from: "/_protected/handle-item",
  });

  // State pour les locations
  const [locationsData, setLocationsData] = useState<GetLocationsQuery | null>(
    null
  );
  const [locationsLoading, setLocationsLoading] = useState(true);

  // Récupérer toutes les locations de la compagnie
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLocationsLoading(true);
        const data = await gqlClient.request<GetLocationsQuery>(GetLocations);
        setLocationsData(data);
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLocationsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Combiner toutes les locations avec les quantités actuelles du produit
  const allLocationsWithQuantities = React.useMemo(() => {
    if (!locationsData?.locations?.data) return [];

    return locationsData.locations.data.map((location: any) => {
      // Chercher si le produit a déjà une quantité dans cette location
      const existingQuantity = product.quantities?.find(
        (qty: any) => qty.location.id === location.id
      );

      return {
        quantity: existingQuantity?.quantity || 0,
        location: {
          id: location.id,
          name: location.name,
          locationType: existingQuantity?.location.locationType || null,
        },
      };
    });
  }, [locationsData, product.quantities]);

  const form = useForm<z.infer<typeof handleAddQuantitySchema>>({
    resolver: zodResolver(handleAddQuantitySchema),
    defaultValues: {
      type,
      product_id: product.product_internal_id || internalId || "",
      location_id: "",
      quantity: "",
    },
  });

  async function onSubmit(values: z.infer<typeof handleAddQuantitySchema>) {
    try {
      await addQuantitySubmit(values);
    } catch (error) {
      console.error("Error adding quantity:", error);
      // The error will be handled by the HTTP client with automatic retry for CSRF issues
      throw error;
    }
  }

  if (!product.quantities) {
    router.navigate({
      to: "/handle-item",
      search: {
        mode,
        type: "add-product",
        scanMode,
        ...(barcode ? { barcode } : {}),
        ...(internalId ? { internalId } : {}),
      },
      replace: true,
    });
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75svh] my-4">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 flex flex-col items-center px-4 w-full max-w-md"
        >
          <img
            src={
              product?.product_image ||
              "https://via.placeholder.com/150?text=No+Image"
            }
            alt={product.product_name}
            className="aspect-square object-cover max-w-1/2 w-full my-6 rounded-md"
          />

          <div className="w-full">
            <h2 className="text-2xl font-semibold text-center">
              {product.product_name || "Unnamed Product"}
            </h2>
            <p className="text-center text-gray-600">
              Category: {product.product_category.name || "Uncategorized"}
            </p>
          </div>

          <div className="w-full flex flex-col gap-y-3">
            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <LocationSelect
                  quantities={
                    locationsLoading ? [] : allLocationsWithQuantities
                  }
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={
                    locationsLoading
                      ? "Loading locations..."
                      : "Select location"
                  }
                  label="Locations"
                  unit={product.product_units || ""}
                  hideEmptyLocations={false}
                  showAllOption={false}
                  allOptionLabel="All locations"
                  displayAllQuantity={true}
                />
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <QuantityInput
                      title="Add quantity"
                      value={field.value}
                      onChange={field.onChange}
                      unit={product.product_units || ""}
                      placeholder="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col w-full gap-x-2 my-4 gap-y-1">
            <Button
              type="submit"
              className="w-full"
              variant="khp-default"
              disabled={!form.formState.isDirty}
            >
              Add Quantity
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xl"
              className={cn("w-full", "border-khp-primary")}
              onClick={() =>
                navigate({
                  to: "/inventory",
                })
              }
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default HandleAddQuantity;
