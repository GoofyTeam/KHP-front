import { useLoaderData, useNavigate } from "@tanstack/react-router";
import z from "zod";

import { useFieldArray, useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { useRef, useState, type ChangeEvent } from "react";

import { Minus, Plus, Image } from "lucide-react";
import api from "../lib/api";
import { cn } from "@workspace/ui/lib/utils";

const stockEntrySchema = z.object({
  quantity: z.string().nonempty("Quantity required"),
  location: z.string().nonempty("Location required"),
});
const handleItemSchema = z.object({
  image: z.instanceof(File).optional(),
  product_name: z.string().nonempty("Product name is required"),
  product_category: z.string().nonempty("Category is required"),
  product_units: z.string().nonempty("Units are required"),
  stockEntries: z
    .array(stockEntrySchema)
    .min(1, "At least one stock entry is required"),
});
type HandleItem = z.infer<typeof handleItemSchema>;

function HandleItem() {
  const navigate = useNavigate();
  const { product, type, availableLocations, categories } = useLoaderData({
    from: "/_protected/handle-item",
  });

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof handleItemSchema>>({
    resolver: zodResolver(handleItemSchema),
    defaultValues: {
      image: undefined,
      product_name: product?.product_name || "",
      product_category: product?.categories?.[0] || "",
      product_units: product?.unit != null ? product.unit.toString() : "",
      stockEntries: [
        { quantity: product?.base_quantity?.toString(), location: undefined },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stockEntries",
  });

  async function onSubmit(values: z.infer<typeof handleItemSchema>) {
    if (type === "add") {
      try {
        await api.post("/api/ingredients", {
          name: values.product_name,
          unit: values.product_units,
          categories: [values.product_category],
          quantities: values.stockEntries.map((entry: HandleItem["stockEntries"][number]) => ({
            quantity: parseInt(entry.quantity),
            location_id: entry.location,
          })),
        });

        navigate({
          to: "/inventory",
          replace: true,
        });
      } catch (error) {
        console.error("Error adding ingredient:", error);
      }
    } else if (type === "remove") {
      try {
        await api.post("/api/ingredients", {
          name: values.product_name,
          unit: values.product_units,
          categories: [values.product_category],
          quantities: values.stockEntries.map((entry: HandleItem["stockEntries"][number]) => ({
            quantity: parseInt(entry.quantity),
            location_id: entry.location,
          })),
        });

        navigate({
          to: "/inventory",
          replace: true,
        });
      } catch (error) {
        console.error("Error adding ingredient:", error);
      }
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75svh] my-4">
      <Form {...form}>
        {filePreview || product?.imageUrl ? (
          <img
            src={filePreview || product?.imageUrl || ""}
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
                    ref={(e: HTMLInputElement | null) => {
                      ref(e);
                      inputRef.current = e;
                    }}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
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
                <FormLabel className="text-lg">Name</FormLabel>
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
          <div className="grid grid-cols-2 gap-4 w-full">
            <FormField
              control={form.control}
              name="product_category"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-lg">Category</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border-khp-primary rounded-md px-4 py-6 truncate">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {product &&
                        product.categories &&
                        product.categories.length > 0 &&
                        product.categories.map((category: string | null) => (
                          <SelectItem
                            key={category || "default"}
                            value={category || ""}
                          >
                            {category || "Uncategorized"}
                          </SelectItem>
                        ))}
                      {categories &&
                        categories.map((categorie: { id: string; name: string }) => (
                          <SelectItem key={categorie.id} value={categorie.name}>
                            {categorie.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="product_units"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-lg">Units</FormLabel>
                  <FormControl>
                    <Input
                      variant="khp-default-pwa"
                      className="w-full"
                      disabled={type === "remove"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4 w-full">
            <h3 className="text-lg font-medium">
              {type === "remove"
                ? "Register the loss of the ingredient"
                : "Stock entries"}
            </h3>
            {fields.map((field: (typeof fields)[number], index: number) => (
              <div key={field.id} className="grid grid-cols-2 gap-4">
                {/* Quantité */}
                <FormField
                  control={form.control}
                  name={`stockEntries.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input {...field} variant="khp-default-pwa" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Localisation */}
                <FormField
                  control={form.control}
                  name={`stockEntries.${index}.location`}
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
                          {availableLocations.map((location: { id: string; name: string }) => (
                            <SelectItem key={location.id} value={location.id}>
                              {location.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>

          <div
            className={cn(
              "grid grid-cols-2 gap-4 w-full",
              type === "remove" ? "hidden" : ""
            )}
          >
            <Button
              type="button"
              variant="khp-destructive"
              size="lg"
              className="w-full my-4"
              disabled={fields.length <= 1}
              onClick={() => remove(fields.length - 1)}
            >
              <Minus />
            </Button>
            <Button
              type="button"
              variant="khp-outline"
              size="lg"
              className="w-full my-4"
              onClick={() => append({ quantity: "", location: "" })}
            >
              <Plus />
            </Button>
          </div>

          <Button
            type="submit"
            variant={type === "remove" ? "khp-destructive" : "khp-default"}
            size="xl"
            className="w-full my-4"
          >
            {type === "remove" ? "Register loss" : "Save"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
export default HandleItem;
