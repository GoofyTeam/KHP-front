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
import { getAllMeasurementUnits } from "../types/mesurmentsUnitEnum";

const stockEntrySchema = z.object({
  quantity: z.string().nonempty("Quantity required"),
  location: z.string().nonempty("Location required"),
});
const handleItemSchema = z
  .object({
    type: z.enum(["add", "update", "remove"]),
    image: z.instanceof(File).optional(),
    product_name: z.string().nonempty("Product name is required"),
    product_category: z.string().nonempty("Category is required"),
    product_units: z.string().nonempty("Units are required"),
    stockEntries: z.array(stockEntrySchema).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== "update") {
      if (!data.stockEntries || data.stockEntries.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least one stock entry is required",
        });
      }
    }
  });
type HandleItem = z.infer<typeof handleItemSchema>;
type StockEntry = NonNullable<HandleItem["stockEntries"]>[number];

function HandleItem() {
  const navigate = useNavigate();
  const { product, type, availableLocations, categories, productId } =
    useLoaderData({
      from: "/_protected/handle-item",
    });

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof handleItemSchema>>({
    resolver: zodResolver(handleItemSchema),
    defaultValues: {
      type: type,
      image: undefined,
      product_name: product?.product_name,
      product_category: product?.product_category?.[0],
      product_units:
        product?.product_units != null ? product.product_units.toString() : "",
      stockEntries:
        type !== "update"
          ? [
              {
                quantity: product?.product_base_quantity
                  ? product.product_base_quantity.toString()
                  : "",
                location: "",
              },
            ]
          : undefined,
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stockEntries",
  });

  async function onSubmit(values: z.infer<typeof handleItemSchema>) {
    if (type === "add" && values.stockEntries) {
      try {
        await api.post("/api/ingredients", {
          name: values.product_name,
          unit: values.product_units,
          categories: [values.product_category],
          quantities: values.stockEntries.map((entry: StockEntry) => ({
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
    } else if (type === "update") {
      try {
        if (values.image) {
          const formData = new FormData();
          formData.append("name", values.product_name);
          formData.append("unit", values.product_units);

          formData.append("categories[]", values.product_category);
          formData.append("image", values.image);
          formData.append("_method", "PUT");

          await api.post(`/api/ingredients/${productId}`, formData);
        } else {
          console.log("send as json");
          await api.put(`/api/ingredients/${productId}`, {
            name: values.product_name,
            unit: values.product_units,
            categories: [values.product_category],
          });
        }

        navigate({
          to: "/products/$id",
          params: { id: productId },
          replace: true,
        });
      } catch (error) {
        console.error("Error updating ingredient:", error);
      }
    } else if (type === "remove" && values.stockEntries) {
      try {
        await api.post("/api/ingredients", {
          name: values.product_name,
          unit: values.product_units,
          categories: [values.product_category],
          quantities: values.stockEntries.map((entry: StockEntry) => ({
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
        {filePreview || product?.product_image ? (
          <img
            src={filePreview || product?.product_image || ""}
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
                        product.product_category &&
                        product.product_category.length > 0 &&
                        product.product_category.map(
                          (category: string | null) => (
                            <SelectItem
                              key={category || "default"}
                              value={category || ""}
                            >
                              {category || "Uncategorized"}
                            </SelectItem>
                          )
                        )}
                      {categories &&
                        categories.map(
                          (categorie: { id: string; name: string }) => {
                            if (
                              product?.product_category &&
                              product.product_category.includes(categorie.name)
                            ) {
                              return null;
                            }
                            return (
                              <SelectItem
                                key={categorie.id}
                                value={categorie.name}
                              >
                                {categorie.name}
                              </SelectItem>
                            );
                          }
                        )}
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
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border-khp-primary rounded-md px-4 py-6 truncate">
                        <SelectValue placeholder="Select units" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {getAllMeasurementUnits().map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {type !== "update" && (
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
                            {availableLocations.map(
                              (location: { id: string; name: string }) => (
                                <SelectItem
                                  key={location.id}
                                  value={location.id}
                                >
                                  {location.name}
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>
          )}

          {type === "add" && (
            <div className={cn("grid grid-cols-2 gap-4 w-full")}>
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
          )}

          <Button
            type="submit"
            variant={type === "remove" ? "khp-destructive" : "khp-default"}
            size="xl"
            className="w-full my-4"
          >
            {type === "add" && "Add new entries"}
            {type === "update" && "Update"}
            {type === "remove" && "Register loss"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
export default HandleItem;
