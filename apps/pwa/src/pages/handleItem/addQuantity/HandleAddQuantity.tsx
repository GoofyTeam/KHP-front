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

function HandleAddQuantity() {
  const navigate = useNavigate();
  const { internalId, barcode, mode, scanMode } = useSearch({
    from: "/_protected/handle-item",
  });
  const { product, type } = useLoaderData({
    from: "/_protected/handle-item",
  });

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
    await addQuantitySubmit(values);
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

          <div className="w-full">
            <FormField
              control={form.control}
              name="location_id"
              render={({ field }) => (
                <LocationSelect
                  quantities={product.quantities || []}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select location"
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
                      title="Move"
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
              disabled={
                form.formState.isSubmitting ||
                !form.formState.dirtyFields.quantity ||
                !form.formState.dirtyFields.location_id
              }
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
