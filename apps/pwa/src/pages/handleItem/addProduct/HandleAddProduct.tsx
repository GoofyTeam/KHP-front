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
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import z from "zod";
import { getAllMeasurementUnits } from "@workspace/ui/lib/measurement-units";
import { addProductSubmit } from "./add-product-submit";
import { Minus, Plus } from "lucide-react";
import { handleItemSchema } from "./handleItemSchema";
import { ImageUploader } from "@workspace/ui/components/image-uploader";
import { extractApiErrorMessage } from "../../../lib/error-utils";
import type { WantedDataType } from "../../../lib/handleScanType";
import { WANTED_IMAGE_SIZE } from "@workspace/ui/lib/const";
import { compressImageFile } from "@workspace/ui/lib/compress-img";

function HandleAddProduct() {
  const navigate = useNavigate();
  const { barcode, internalId } = useSearch({
    from: "/_protected/handle-item",
  });
  const { product, type, availableLocations, categories, dataSources, status } =
    useLoaderData({
      from: "/_protected/handle-item",
    }) as {
      product: WantedDataType | null;
      type: z.infer<typeof handleItemSchema>["type"];
      availableLocations: Array<{
        id: string;
        name: string;
        locationType?: { id: string; name: string; is_default: boolean } | null;
      }>;
      categories: Array<{ id: string; name: string }>;
      dataSources: Record<string, { source: string; timestamp: number | null }>;
      status?: "ok" | "missing-offline";
    };

  if (status === "missing-offline") {
    return (
      <div className="flex min-h-[75svh] flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-sm text-muted-foreground">
          La création d'un produit hors connexion nécessite une synchronisation
          préalable (catégories et localisations). Réessaye quand la connexion
          est disponible.
        </p>
        <Button
          variant="khp-default"
          onClick={() =>
            navigate({
              to: "/inventory",
              replace: true,
            })
          }
        >
          Retour à l'inventaire
        </Button>
      </div>
    );
  }

  const locationsSource = dataSources?.locations?.source;
  const categoriesSource = dataSources?.categories?.source;

  const effectiveLocations: typeof availableLocations =
    availableLocations?.length === 0
      ? ((product?.quantities || [])
          .map((qty) => qty.location)
          .filter(
            (loc): loc is NonNullable<typeof loc> => loc != null
          )
          .map((loc) => ({
            id: loc.id,
            name: loc.name,
            locationType: loc.locationType ?? null,
          })) as unknown as typeof availableLocations)
      : availableLocations;

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const storageUnitDefault = getAllMeasurementUnits().find(
    (unit) => unit.value === "unit"
  )?.value;

  const typedType = type as z.infer<typeof handleItemSchema>["type"];

  const form = useForm<
    z.infer<typeof handleItemSchema>,
    undefined,
    z.infer<typeof handleItemSchema>
  >({
    resolver: zodResolver(handleItemSchema),
    defaultValues: {
      type: typedType,
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

  const handleImageCapture = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result as string);
      form.setValue("image", file);
    };
    reader.readAsDataURL(file);
  };

  const handleClearImage = () => {
    setFilePreview(null);
    form.setValue("image", undefined);
  };

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
        <ImageUploader
          imagePreview={filePreview || product?.product_image || null}
          onImageCapture={handleImageCapture}
          onClearImage={handleClearImage}
          ingredientName={form.watch("product_name") || "product"}
          label="Product Image"
        />

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 flex flex-col items-center px-4 w-full max-w-md"
        >
          {locationsSource === "missing-offline" && (
            <div className="bg-amber-100 text-amber-900 border border-amber-200 px-3 py-2 rounded-md text-sm text-center w-full">
              Les localisations n'ont pas été entièrement synchronisées hors
              connexion. Seules celles déjà connues sont proposées.
            </div>
          )}
          {categoriesSource === "missing-offline" && (
            <div className="bg-amber-100 text-amber-900 border border-amber-200 px-3 py-2 rounded-md text-sm text-center w-full">
              Les catégories n'ont pas pu être chargées hors connexion. Tu pourras
              en sélectionner une quand la connexion sera rétablie.
            </div>
          )}
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
                    disabled={categories?.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full border-khp-primary rounded-md px-4 py-6 truncate">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories?.map(
                        (categorie: { id: string; name: string }) => (
                          <SelectItem key={categorie.id} value={categorie.id}>
                            {categorie.name}
                          </SelectItem>
                        )
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
                  <FormLabel className="text-lg">
                    Quantity for one portion
                  </FormLabel>
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
                  <FormLabel className="text-lg">Portion Unit</FormLabel>
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
                          {effectiveLocations.map(
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
