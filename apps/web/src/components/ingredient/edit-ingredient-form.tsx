"use client";

import { z } from "zod";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { ImageAdd } from "@workspace/ui/components/image-placeholder";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { AlertCircle, CheckCircle, Loader2, X } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";
import { Label } from "@workspace/ui/components/label";
import { MultiSelect } from "@workspace/ui/components/multi-select";

import { useQuery } from "@apollo/client";
import {
  GetMeasurementUnitsDocument,
  GetCategoriesDocument,
  GetAllergensDocument,
  type GetIngredientQuery,
} from "@/graphql/generated/graphql";
import { createAllergenOptions } from "@workspace/ui/lib/allergens";
import { updateIngredientAction } from "@/app/(mainapp)/ingredient/actions";

type IngredientData = NonNullable<GetIngredientQuery["ingredient"]>;

interface EditIngredientFormProps {
  ingredient: IngredientData;
}

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"] as const;

const editIngredientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  image: z
    .instanceof(File)
    .optional()
    .refine(
      (file) => {
        if (!file) return true;
        return (
          ACCEPTED_IMAGE_TYPES.includes(
            file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]
          ) && file.size <= MAX_IMAGE_SIZE_BYTES
        );
      },
      { message: "L'image doit être un fichier JPEG ou PNG de moins de 10Mo" }
    ),
  unit: z.string().nonempty("Unit is required"),
  base_quantity: z
    .string()
    .optional()
    .refine((val) => {
      if (val === undefined || val === "") return true;
      const num = Number(val);
      return !Number.isNaN(num) && num >= 0;
    }, "Base quantity must be a non-negative number"),
  base_unit: z.string().nonempty("Base unit is required"),
  category_id: z
    .string()
    .refine((val) => val !== undefined && val !== "", "Category is required"),
  allergens: z.array(z.string()).optional(),
});

export type EditIngredientFormValues = z.infer<typeof editIngredientSchema>;

const CATEGORY_PAGE_SIZE = 20;

const DEFAULT_FORM_VALUES: Omit<EditIngredientFormValues, "image"> & {
  image?: File;
} = {
  name: "",
  image: undefined,
  unit: "",
  base_quantity: "",
  base_unit: "",
  category_id: "",
  allergens: [],
};

export function EditIngredientForm({ ingredient }: EditIngredientFormProps) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: categoriesData, loading: categoriesLoading } = useQuery(
    GetCategoriesDocument,
    {
      variables: {
        first: CATEGORY_PAGE_SIZE,
        page: 1,
      },
      fetchPolicy: "cache-and-network",
    }
  );

  const { data: unitsData } = useQuery(GetMeasurementUnitsDocument, {
    fetchPolicy: "cache-and-network",
  });

  const { data: allergensData } = useQuery(GetAllergensDocument, {
    fetchPolicy: "cache-and-network",
  });

  const form = useForm<EditIngredientFormValues>({
    resolver: zodResolver(editIngredientSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const categoriesOptions = (categoriesData?.categories?.data ?? []).map(
    (category) => ({
      value: category.id,
      label: category.name,
    })
  );

  const unitsOptions = (unitsData?.measurementUnits ?? []).map((unit) => ({
    value: unit.value,
    label: unit.label,
  }));

  const allergenOptions = createAllergenOptions(allergensData?.allergens ?? []);

  useEffect(() => {
    if (!ingredient) {
      return;
    }

    setFilePreview(ingredient.image_url ?? null);

    form.reset({
      name: ingredient.name ?? "",
      image: undefined,
      unit: ingredient.unit?.toString() ?? "",
      base_quantity:
        ingredient.base_quantity !== undefined &&
        ingredient.base_quantity !== null
          ? String(ingredient.base_quantity)
          : "",
      base_unit: ingredient.base_unit?.toString() ?? "",
      category_id: ingredient.category?.id ?? "",
      allergens: ingredient.allergens ?? [],
    });
  }, [ingredient, form]);

  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>, onChange: (file?: File) => void) => {
      const file = event.target.files?.[0];

      if (!file) {
        setFilePreview(ingredient?.image_url ?? null);
        onChange(undefined);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result as string);
        onChange(file);
      };
      reader.readAsDataURL(file);
    },
    [ingredient?.image_url]
  );

  const handleRemoveImage = useCallback(() => {
    setFilePreview(null);
    form.setValue("image", undefined);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [form]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const updateData: {
        ingredientId: string;
        name: string;
        unit: string;
        category_id?: number | null;
        image?: File;
        base_quantity?: number;
        base_unit?: string;
        allergens?: string[];
      } = {
        ingredientId: ingredient.id,
        name: values.name,
        unit: values.unit,
        category_id:
          values.category_id && values.category_id.trim() !== ""
            ? parseInt(values.category_id)
            : null,
      };

      if (values.image) {
        updateData.image = values.image;
      }

      if (
        values.base_quantity !== undefined &&
        values.base_quantity.trim() !== ""
      ) {
        const baseQuantityNum = parseFloat(values.base_quantity);
        if (!isNaN(baseQuantityNum) && baseQuantityNum > 0) {
          updateData.base_quantity = baseQuantityNum;
        }
      }

      if (values.base_unit && values.base_unit.trim() !== "") {
        updateData.base_unit = values.base_unit.trim();
      }

      updateData.allergens = values.allergens || [];

      const result = await updateIngredientAction(updateData);

      if (result.success) {
        setSuccess(true);
        router.push(`/ingredient/${ingredient.id}`);
        return;
      }

      const errorMessage = result.error || "Failed to update ingredient.";
      form.setError("root", {
        type: "server",
        message: errorMessage,
      });
    } catch (error) {
      form.setError("root", {
        type: "server",
        message: "An unexpected error occurred. Please try again.",
      });
    }
  });

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
          <h3 className="text-2xl font-semibold text-khp-text-primary mb-3">
            Ingredient Updated!
          </h3>
          <p className="text-lg text-khp-text-secondary mb-4">
            The ingredient has been updated successfully.
          </p>
          <p className="text-base text-khp-text-secondary">Redirecting...</p>
        </div>
      </div>
    );
  }

  const rootErrorLines = form.formState.errors.root?.message
    ?.split("\n")
    .filter(Boolean);

  return (
    <div className="w-full p-4 lg:p-6">
      <Form {...form}>
        <form onSubmit={onSubmit} className="w-full max-w-6xl mx-auto">
          <div className="w-full max-w-4xl mx-auto flex flex-col min-h-[600px]">
            <div className="flex-1 space-y-6">
              {filePreview ? (
                <div className="relative max-w-1/2 w-full my-6 mx-auto">
                  <img
                    src={filePreview}
                    alt={form.watch("name") || "Ingredient image"}
                    className="aspect-square object-cover w-full rounded-md cursor-pointer"
                    onClick={() => inputRef.current?.click()}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-lg"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative max-w-1/2 w-full my-6 mx-auto">
                  <ImageAdd
                    className="w-full aspect-square"
                    iconSize={64}
                    onClick={() => inputRef.current?.click()}
                  />
                </div>
              )}

              {form.formState.errors.image && (
                <div className="w-full text-red-500 text-sm mt-1 text-center">
                  {form.formState.errors.image.message ||
                    "Please select an image."}
                </div>
              )}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>
                      Ingredient name <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input {...field} variant="khp-default" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        accept={ACCEPTED_IMAGE_TYPES.join(",")}
                        max={MAX_IMAGE_SIZE_BYTES}
                        capture="environment"
                        ref={(element: HTMLInputElement | null) => {
                          ref(element);
                          inputRef.current = element;
                        }}
                        onChange={(event: ChangeEvent<HTMLInputElement>) =>
                          handleImageChange(event, onChange)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex flex-col gap-4 mb-6">
                <Label className="text-xl font-semibold">Details</Label>
                <div className="grid grid-cols-2 w-full gap-4">
                  <FormField
                    control={form.control}
                    name="base_quantity"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          Base quantity (for one unit)
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input {...field} className="border-khp-primary" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="base_unit"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          Unit <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full border-khp-primary">
                              <SelectValue placeholder="Select a unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {unitsOptions?.map((u) => (
                                <SelectItem key={u.value} value={u.value}>
                                  {u.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 w-full gap-4">
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          Storage unit <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full border-khp-primary">
                              <SelectValue placeholder="Select a unit" />
                            </SelectTrigger>
                            <SelectContent>
                              {unitsOptions?.map((u) => (
                                <SelectItem key={u.value} value={u.value}>
                                  {u.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category_id"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          Category <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger className="w-full border-khp-primary">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categoriesOptions?.map((category) => (
                                <SelectItem
                                  key={category.value}
                                  value={category.value}
                                >
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="allergens"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Allergens</FormLabel>
                      <FormControl>
                        <MultiSelect
                          options={allergenOptions}
                          value={field.value || []}
                          onValueChange={field.onChange}
                          placeholder="Select allergens"
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {form.formState.errors.root?.message && (
            <div className="w-full max-w-4xl mx-auto flex flex-col min-h-[600px]">
              <div className="w-full p-4 bg-khp-error/10 border border-khp-error/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-khp-error mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    {rootErrorLines?.map((line, idx) => (
                      <p
                        key={idx}
                        className={`text-sm ${
                          idx === 0 ? "font-medium" : ""
                        } text-khp-error`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="w-full max-w-4xl mx-auto mt-4">
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              <Button
                variant="khp-destructive"
                type="button"
                className="flex-1"
                onClick={() => router.push(`/ingredient/${ingredient.id}`)}
              >
                Cancel
              </Button>
              <Button
                variant="khp-default"
                type="submit"
                className="flex-1"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting
                  ? "Updating..."
                  : "Update ingredient"}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
