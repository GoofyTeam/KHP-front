import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLoaderData } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@workspace/ui/components/form";
import {
  LocationSelect,
  locationSelectMapper,
  LocationsFromCompany,
} from "@workspace/ui/components/location-select";
import { QuantityInput } from "@workspace/ui/components/quantity-input";
import { cn } from "@workspace/ui/lib/utils";
import { useForm } from "react-hook-form";
import z from "zod";
import { moveQuantitySchema } from "./moveQuantitySchema";
import moveQuantitySubmit from "./move-quantity";

function MoveQuantity() {
  const navigate = useNavigate();
  const { product, availableLocations } = useLoaderData({
    from: "/_protected/move-quantity",
  });
  const form = useForm<z.infer<typeof moveQuantitySchema>>({
    resolver: zodResolver(moveQuantitySchema),
    defaultValues: {
      product_id: product.product_internal_id,
      quantity: "",
      source_id: "",
      destination_id: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof moveQuantitySchema>) => {
    await moveQuantitySubmit(data);
  };

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
              name="source_id"
              render={({ field }) => (
                <LocationSelect
                  quantities={product.quantities || []}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select source location"
                  label="From"
                  unit={product.product_units || ""}
                  hideEmptyLocations={true}
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
            <FormField
              control={form.control}
              name="destination_id"
              render={({ field }) => (
                <LocationSelect
                  quantities={
                    locationSelectMapper(
                      availableLocations as unknown as LocationsFromCompany[]
                    ) || []
                  }
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select destination location"
                  label="To"
                  unit={product.product_units || ""}
                  hideEmptyLocations={false}
                  showAllOption={false}
                  allOptionLabel="All locations"
                  displayAllQuantity={true}
                />
              )}
            />
          </div>

          <div className="flex flex-col w-full gap-x-2 my-4 gap-y-1">
            <Button
              type="submit"
              className="w-full"
              variant="khp-default"
              disabled={
                form.formState.isSubmitting &&
                (!form.formState.dirtyFields.product_id ||
                  !form.formState.dirtyFields.quantity ||
                  !form.formState.dirtyFields.source_id ||
                  !form.formState.dirtyFields.destination_id)
              }
            >
              Move this quantity
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

export default MoveQuantity;
