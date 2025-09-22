import { zodResolver } from "@hookform/resolvers/zod";
import { useSearch, useLoaderData, useNavigate } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import { useState, useRef, ChangeEvent } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import z from "zod";
import { getAllMeasurementUnits } from "@workspace/ui/lib/measurement-units";
import { addProductSubmit } from "./add-product-submit";
import { Minus, Plus } from "lucide-react";
import { handleItemSchema } from "./handleItemSchema";
import { ImageAdd } from "@workspace/ui/components/image-placeholder";
import { extractApiErrorMessage } from "../../../lib/error-utils";
import { WANTED_IMAGE_SIZE } from "@workspace/ui/lib/const";
import { compressImageFile } from "@workspace/ui/lib/compress-img";

function HandleAddProduct() {
  const navigate = useNavigate();
  const { barcode, internalId } = useSearch({
    from: "/_protected/handle-item",
  });
  const { product, type, availableLocations, categories } = useLoaderData({
    from: "/_protected/handle-item",
  });

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const storageUnitDefault = getAllMeasurementUnits().find(
    (unit) => unit.value === "unit"
  )?.value;

  const form = useForm<z.infer<typeof handleItemSchema>>({
    resolver: zodResolver(handleItemSchema),
    defaultValues: {
      type: type,
      image: undefined,
      product_name: product?.product_name,
      product_category:
        product?.product_category.id && product?.product_category.id !== ""
          ? product?.product_category.id
          : undefined,
      product_units:
        product?.product_units != null
          ? product.product_units.toString()
          : storageUnitDefault,
      quantityPerUnit:
        product?.product_base_quantity != null
          ? product.product_base_quantity.toString()
          : "",
      product_base_unit:
        product?.product_base_unit != null ? product.product_base_unit : "",
      stockEntries: [
        {
          quantity: "",
          location: "",
        },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "stockEntries",
  });

  async function onSubmit(values: z.infer<typeof handleItemSchema>) {
    setServerError(null);
    try {
      let payload = values;

      if (values.image instanceof File) {
        const compressed = await compressImageFile(values.image, {
          maxSizeBytes: WANTED_IMAGE_SIZE,
          maxWidth: 1600,
          maxHeight: 1600,
          mimeType: "image/jpeg",
        });
        if (compressed.size > WANTED_IMAGE_SIZE) {
          form.setError("image", {
            type: "validate",
            message: "Image exceeds 2MB after compression.",
          });
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.setValue("image", compressed as any, { shouldValidate: false });
        payload = { ...values, image: compressed };
      }

      await addProductSubmit(payload, barcode, internalId, product!);
    } catch (err) {
      setServerError(extractApiErrorMessage(err));
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[75svh] my-4">
      <Form {...form}>
        {filePreview || product?.product_image ? (
          <img
            src={filePreview || product?.product_image || ""}
            alt={form.getValues().product_name || "Product Image"}
            className="aspect-square object-cover max-w-1/2 w-full my-6 rounded-md"
            onClick={() => inputRef.current?.click()}
          />
        ) : (
          <ImageAdd iconSize={32} onClick={() => inputRef.current?.click()} />
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
                      {categories &&
                        categories.map(
                          (categorie: { id: string; name: string }) => {
                            return (
                              <SelectItem
                                key={categorie.id}
                                value={categorie.id}
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
                  <FormLabel className="text-lg">Storage unit</FormLabel>
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
          <div className="grid grid-cols-2 gap-4 w-full">
            <FormField
              control={form.control}
              name="quantityPerUnit"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-lg">Quantity per unit</FormLabel>
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
            <FormField
              control={form.control}
              name="product_base_unit"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel className="text-lg">
                    Base unit for one unit
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border-khp-primary rounded-md px-4 py-6 truncate">
                        <SelectValue placeholder="Select base unit" />
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

          <div className="space-y-4 w-full">
            <h3 className="text-lg font-medium">Add new entries</h3>
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
                              <SelectItem key={location.id} value={location.id}>
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

          {serverError && (
            <div
              role="alert"
              className="w-full max-w-md mx-auto mb-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
            >
              {serverError}
            </div>
          )}

          <div className="flex flex-col w-full gap-x-2 my-4 gap-y-1">
            <Button
              type="submit"
              variant="khp-default"
              size="xl"
              className="w-full my-4"
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
            >
              Add new item to inventory
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

export default HandleAddProduct;
