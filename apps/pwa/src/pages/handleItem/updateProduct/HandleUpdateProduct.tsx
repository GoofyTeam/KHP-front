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
import { useForm } from "react-hook-form";
import z from "zod";
import { getAllMeasurementUnits } from "@workspace/ui/lib/measurement-units";
import { Image } from "lucide-react";
import { handleUpdateProductSchema } from "./handleUpdateProductSchema";
import { updateProductSubmit } from "./update-product";
import { extractApiErrorMessage } from "../../../lib/error-utils";
import { compressImageFile } from "@workspace/ui/lib/compress-img";
import { WANTED_IMAGE_SIZE } from "@workspace/ui/lib/const";

function HandleUpdateProduct() {
  const navigate = useNavigate();
  const { internalId } = useSearch({
    from: "/_protected/handle-item",
  });
  const { product, type, categories } = useLoaderData({
    from: "/_protected/handle-item",
  });

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
        {filePreview || product?.product_image ? (
          <img
            src={filePreview || product?.product_image || ""}
            alt={form.getValues().product_name || "Product Image"}
            className="aspect-square object-cover max-w-1/2 w-full my-6 rounded-md"
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
