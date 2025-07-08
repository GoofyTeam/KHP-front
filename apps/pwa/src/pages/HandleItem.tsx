import { useLoaderData } from "@tanstack/react-router";
import z from "zod";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { useRef, useState } from "react";

import { Image } from "lucide-react";

const handleItemSchema = z
  .object({
    method: z.enum(["add", "update", "db", "remove"]),
    image: z.string().url().optional(),
    product_name: z.string(),
    product_category: z.string(),
    product_units: z.string().optional(),
    product_quantity: z.string().optional(),
    quantity_lost: z.string().optional(),
    reason_lost: z.string().optional(),
  })
  .refine((data) => {
    if (data.method === "remove") {
      return data.quantity_lost !== undefined && data.reason_lost !== undefined;
    }
    if (data.method === "add" || data.method === "update") {
      return data.product_name !== "" && data.product_category !== "";
    }

    return true;
  });

function HandleItem() {
  const { product, type } = useLoaderData({
    from: "/_protected/handle-item",
  });

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof handleItemSchema>>({
    resolver: zodResolver(handleItemSchema),
    defaultValues: {
      image: undefined,
      product_name: product?.product_name || "",
      product_category: product?.categories[0] || "",
      product_units: product?.quantity || "",
      product_quantity: product?.quantity || "",
    },
  });

  console.log("Product form page loaded with data:", product);

  function onSubmit(values: z.infer<typeof handleItemSchema>) {
    // TODO: handle submition
    console.log(values);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75svh] my-4">
      <Form {...form}>
        {filePreview || product?.image_url ? (
          <img
            src={filePreview || product?.image_url || ""}
            alt={form.getValues().product_name || "Product Image"}
            className="aspect-square object-contain max-w-1/2 w-full my-6"
            onClick={() => inputRef.current?.click()}
          />
        ) : (
          <div
            className="aspect-square h-34 w-34 border border-khp-primary rounded-lg flex flex-col items-center justify-center my-4 cursor-pointer hover:bg-khp-primary/10"
            onClick={() => inputRef.current?.click()}
          >
            <Image className="text-khp-primary" strokeWidth={1} size={32} />
            <p className="text-khp-primary font-light">Add a picture</p>
          </div>
        )}

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 flex flex-col items-center px-4 w-full max-w-md"
        >
          <FormField
            control={form.control}
            name="image"
            render={({ field: { ref, onChange, name } }) => (
              <FormItem className="hidden">
                <FormControl>
                  <Input
                    variant="khp-default"
                    type="file"
                    name={name}
                    accept="image/*"
                    capture="environment"
                    ref={(e) => {
                      ref(e);
                      inputRef.current = e;
                    }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFilePreview(reader.result as string);
                          onChange(file);
                        };
                        reader.readAsDataURL(file);
                      } else {
                        setFilePreview(null);
                        onChange(undefined);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="product_name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-lg">Product Name</FormLabel>
                <FormControl>
                  <Input
                    variant="khp-default-pwa"
                    className="w-full"
                    {...field}
                    disabled={type === "remove"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="product_category"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-lg">Product Category</FormLabel>
                <FormControl>
                  <Input
                    variant="khp-default-pwa"
                    className="w-full"
                    {...field}
                    disabled={type === "remove"}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {type !== "remove" && (
            <FormField
              control={form.control}
              name="product_units"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-lg">Product Units</FormLabel>
                  <FormControl>
                    <Input
                      variant="khp-default-pwa"
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {type !== "remove" && (
            <FormField
              control={form.control}
              name="product_quantity"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-lg">Product Quantity</FormLabel>
                  <FormControl>
                    <Input
                      variant="khp-default-pwa"
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {type === "remove" && (
            <FormField
              control={form.control}
              name="quantity_lost"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-lg">Lost quantity</FormLabel>
                  <FormControl>
                    <Input
                      variant="khp-default-pwa"
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {type === "remove" && (
            <FormField
              control={form.control}
              name="reason_lost"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-lg">Reason for loss</FormLabel>
                  <FormControl>
                    <Input
                      variant="khp-default-pwa"
                      className="w-full"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button
            type="submit"
            variant={type === "remove" ? "khp-destructive" : "khp-default"}
            size="xl"
            className="w-full"
          >
            {type === "remove" ? "Register loss" : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
export default HandleItem;
