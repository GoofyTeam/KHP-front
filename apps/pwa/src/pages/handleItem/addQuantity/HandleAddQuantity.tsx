import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { useForm } from "react-hook-form";
import z from "zod";
import { handleAddQuantitySchema } from "./handleAddQuantitySchema";
import { useLoaderData, useSearch } from "@tanstack/react-router";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";

function HandleAddQuantity() {
  const { internalId } = useSearch({
    from: "/_protected/handle-item",
  });
  const { product, type } = useLoaderData({
    from: "/_protected/handle-item",
  });

  const form = useForm<z.infer<typeof handleAddQuantitySchema>>({
    resolver: zodResolver(handleAddQuantitySchema),
    defaultValues: {
      type,
      product_id: internalId,
      location_id: "",
      quantity: "",
    },
  });

  async function onSubmit(values: z.infer<typeof handleAddQuantitySchema>) {
    console.log(values);
    // await addQuantitySubmit(values);
  }

  if (!product.quantities) {
    throw new Error("No quantities available for this product");
    //TODO redirect to  add product page
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
            className="aspect-square object-contain max-w-1/2 w-full my-6"
          />

          <div className="w-full">
            <h2 className="text-2xl font-semibold text-center">
              {product.product_name || "Unnamed Product"}
            </h2>
            <p className="text-center text-gray-600">
              Category: {product.product_category || "Uncategorized"}
            </p>
          </div>

          <div>
            <FormField
              control={form.control}
              name={"location_id"}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border-khp-primary rounded-md px-4 py-6 truncate">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {product.quantities?.map((el) => (
                        <SelectItem key={el.location.id} value={el.location.id}>
                          {el.location.name} (Current: {el.quantity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}

export default HandleAddQuantity;
