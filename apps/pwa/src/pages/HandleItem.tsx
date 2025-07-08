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

const handleItemSchema = z.object({
  image: z.string().url().optional(),
  product_name: z.string(),
  product_category: z.string(),
  product_units: z.string(),
  product_quantity: z.string(),
});

function HandleItem() {
  const { product } = useLoaderData({
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
        <img
          src={filePreview || product?.image_url || ""}
          alt={form.getValues().product_name || "Product Image"}
          className="aspect-square object-contain max-w-1/2 w-full my-6"
          onClick={() => inputRef.current?.click()}
        />
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
                          onChange(file); // Mettre à jour le champ du formulaire avec le fichier
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
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input variant="khp-default" className="w-full" {...field} />
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
                <FormLabel>Product Category</FormLabel>
                <FormControl>
                  <Input variant="khp-default" className="w-full" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="product_units"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Product Units</FormLabel>
                <FormControl>
                  <Input variant="khp-default" className="w-full" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="product_quantity"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Product Quantity</FormLabel>
                <FormControl>
                  <Input variant="khp-default" className="w-full" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            variant="khp-default"
            size="lg"
            className="w-full"
          >
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
export default HandleItem;
