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
import { useForm } from "react-hook-form";
import z from "zod";
import { getAllMeasurementUnits } from "@workspace/ui/lib/measurement-units";
import { handleUpdateProductSchema } from "./handleUpdateProductSchema";
import { updateProductSubmit } from "./update-product";
import { extractApiErrorMessage } from "../../../lib/error-utils";
import { compressImageFile } from "@workspace/ui/lib/compress-img";
import { WANTED_IMAGE_SIZE } from "@workspace/ui/lib/const";
import { ImageUploader } from "@workspace/ui/components/image-uploader";

function HandleUpdateProduct() {
  const navigate = useNavigate();
  const { internalId } = useSearch({
    from: "/_protected/handle-item",
  });
  const { product, type, categories } = useLoaderData({
    from: "/_protected/handle-item",
  });

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof handleUpdateProductSchema>>({
    resolver: zodResolver(handleUpdateProductSchema),
    defaultValues: {
      type: type,
      image: undefined,
      product_name: undefined,
      product_category: undefined,
      product_units: undefined,
      quantityPerUnit: undefined,
      product_base_unit: undefined,
    },
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

  async function onSubmit(values: z.infer<typeof handleUpdateProductSchema>) {
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

      await updateProductSubmit(payload, internalId);
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
                    placeholder={product?.product_name || "Product Name"}
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
                  <FormLabel className="text-lg">
                    Quantity for one portion
                  </FormLabel>
                  <FormControl>
                    <Input
                      variant="khp-default-pwa"
                      className="w-full"
                      placeholder={
                        product?.product_base_quantity
                          ? product.product_base_quantity
                          : "e.g. 1"
                      }
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
              className="w-full"
              disabled={!form.formState.isDirty || form.formState.isSubmitting}
            >
              Update Product
            </Button>
            <Button
              type="button"
              variant="outline"
              size="xl"
              className={cn("w-full", "border-khp-primary")}
              onClick={() =>
                navigate({
                  to: "/products/$id",
                  params: { id: internalId! },
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

export default HandleUpdateProduct;
