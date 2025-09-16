"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";

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
import { PreparationEntitiesField } from "@/components/preparation/PreparationEntitiesField";
import { Button } from "@workspace/ui/components/button";
import { AlertCircle } from "lucide-react";
import { LoadMoreSelect } from "@workspace/ui/components/load-more-select";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";
import { Label } from "@workspace/ui/components/label";

import { NetworkStatus, useApolloClient, useQuery } from "@apollo/client";
import {
  GetCategoriesDocument,
  type GetCategoriesQuery,
  GetPreparationByIdDocument,
  type GetPreparationByIdQuery,
} from "@/graphql/generated/graphql";
import { getAllMeasurementUnitsOnlyValues } from "@/lib/mesurmentsUnit";
import { updatePreparationAction } from "./action";

const preparationItemsSchema = z.object({
  id: z.string().nonempty(),
  type: z.enum(["ingredient", "preparation"]),
  quantity: z
    .number({ invalid_type_error: "Quantity is required" })
    .positive("Quantity must be a positive number"),
  unit: z.string().nonempty("Unit is required"),
  location_id: z.string().nonempty("Location is required"),
  name: z.string().optional(),
  imageUrl: z.string().nullable().optional(),
  locations: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        quantityInLocation: z.number(),
      })
    )
    .optional(),
  storage_unit: z.string().optional(),
});

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"] as const;

const updatePreparationSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    image: z
      .instanceof(File)
      .optional()
      .refine((file) => {
        if (!file) return true;
        return (
          ACCEPTED_IMAGE_TYPES.includes(
            file.type as (typeof ACCEPTED_IMAGE_TYPES)[number]
          ) && file.size <= MAX_IMAGE_SIZE_BYTES
        );
      }, "Image must be a JPEG or PNG file and less than 10MB"),
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
    entities: z
      .array(preparationItemsSchema)
      .min(1, "At least one item is required"),
  })
  .superRefine((data, ctx) => {
    data.entities.forEach((item, index) => {
      if (item.quantity <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Item ${index + 1}: Quantity must be a positive number`,
          path: ["entities", index, "quantity"],
        });
      }
      if (!item.location_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Item ${index + 1}: Location is required`,
          path: ["entities", index, "location_id"],
        });
      }
    });
  });

export type UpdatePreparationFormValues = z.infer<
  typeof updatePreparationSchema
>;

const CATEGORY_PAGE_SIZE = 20;

const DEFAULT_FORM_VALUES: UpdatePreparationFormValues = {
  name: "",
  image: undefined,
  unit: "",
  base_quantity: "",
  base_unit: "",
  category_id: "",
  entities: [],
};

export default function UpdatePreparationPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;
  const router = useRouter();
  const apolloClient = useApolloClient();

  const [filePreview, setFilePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    data: categoriesData,
    loading: categoriesLoading,
    fetchMore: fetchMoreCategories,
    networkStatus: categoriesNetworkStatus,
  } = useQuery<GetCategoriesQuery>(GetCategoriesDocument, {
    variables: {
      first: CATEGORY_PAGE_SIZE,
      page: 1,
    },
    fetchPolicy: "cache-and-network",
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: preparationData,
    loading: preparationLoading,
    error: preparationError,
  } = useQuery<GetPreparationByIdQuery>(GetPreparationByIdDocument, {
    variables: { id },
    skip: !id,
    fetchPolicy: "cache-and-network",
  });

  const categoriesOptions = useMemo(() => {
    const list = categoriesData?.categories?.data ?? [];
    return list.map((category) => ({
      value: category.id,
      label: category.name,
    }));
  }, [categoriesData]);

  const categoriesPaginator = categoriesData?.categories?.paginatorInfo;
  const hasMoreCategories = categoriesPaginator?.hasMorePages ?? false;
  const currentCategoryPage = categoriesPaginator?.currentPage ?? 1;
  const isFetchingMoreCategories =
    categoriesNetworkStatus === NetworkStatus.fetchMore;
  const isCategoriesLoading = categoriesLoading || isFetchingMoreCategories;

  const handleLoadMoreCategories = useCallback(() => {
    if (!hasMoreCategories || isFetchingMoreCategories) {
      return;
    }

    const nextPage = currentCategoryPage + 1;

    fetchMoreCategories({
      variables: {
        first: CATEGORY_PAGE_SIZE,
        page: nextPage,
      },
      updateQuery: (previous, { fetchMoreResult }) => {
        if (!fetchMoreResult?.categories) {
          return previous;
        }

        if (!previous?.categories) {
          return fetchMoreResult;
        }

        return {
          ...fetchMoreResult,
          categories: {
            ...fetchMoreResult.categories,
            data: [
              ...(previous.categories?.data ?? []),
              ...(fetchMoreResult.categories.data ?? []),
            ],
          },
        };
      },
    }).catch((error) => {
      console.error("Error loading more categories:", error);
    });
  }, [
    hasMoreCategories,
    isFetchingMoreCategories,
    currentCategoryPage,
    fetchMoreCategories,
  ]);

  const form = useForm<UpdatePreparationFormValues>({
    resolver: zodResolver(updatePreparationSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const unitsSelections = useMemo(getAllMeasurementUnitsOnlyValues, []);

  const preparation = preparationData?.preparation;

  useEffect(() => {
    if (!preparation) {
      return;
    }

    setFilePreview(preparation.image_url ?? null);

    const mappedEntities = (preparation.entities ?? []).map((entity) => {
      const inner = entity.entity;
      const locations = inner.quantities.map((quantity) => ({
        id: quantity.location.id,
        name: quantity.location.name,
        quantityInLocation: quantity.quantity,
      }));
      const isIngredient = inner.__typename === "Ingredient";
      const entityType: "ingredient" | "preparation" = isIngredient
        ? "ingredient"
        : "preparation";
      const locationId = entity.location?.id ?? "";
      return {
        id: inner.id,
        type: entityType,
        quantity: entity.quantity,
        unit: entity.unit,
        location_id: locationId,
        name: inner.name,
        imageUrl: inner.image_url ?? null,
        locations,
        storage_unit: inner.unit,
      };
    });

    form.reset({
      name: preparation.name ?? "",
      image: undefined,
      unit: preparation.unit ?? "",
      base_quantity:
        preparation.base_quantity !== undefined &&
        preparation.base_quantity !== null
          ? String(preparation.base_quantity)
          : "",
      base_unit: preparation.base_unit ?? "",
      category_id: preparation.categories?.[0]?.id ?? "",
      entities: mappedEntities,
    });
  }, [preparation, form]);

  useEffect(() => {
    if (!preparationLoading && !preparation && !preparationError) {
      router.push("/preparations");
    }
  }, [preparationLoading, preparation, preparationError, router]);

  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>, onChange: (file?: File) => void) => {
      const file = event.target.files?.[0];

      if (!file) {
        setFilePreview(preparation?.image_url ?? null);
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
    [preparation?.image_url]
  );

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await updatePreparationAction(id, values);

      if (result.success) {
        apolloClient.refetchQueries({
          include: [GetPreparationByIdDocument],
        });
        router.push(`/preparations/${id}`);
        return;
      }

      const errorMessage = result.error || "Failed to update preparation.";
      form.setError("root", {
        type: "server",
        message: errorMessage,
      });
    } catch (error) {
      console.error("Failed to update preparation:", error);
      form.setError("root", {
        type: "server",
        message: "An unexpected error occurred. Please try again.",
      });
    }
  });

  if (preparationError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-khp-error text-center">
          Error loading preparation: {preparationError.message}
        </p>
        <Button
          variant="khp-outline"
          onClick={() => router.push("/preparations")}
        >
          Back to preparations
        </Button>
      </div>
    );
  }

  if (preparationLoading && !preparation) {
    return <div>Loading...</div>;
  }

  const rootErrorLines = form.formState.errors.root?.message
    ?.split("")
    .filter(Boolean);

  return (
    <div className="flex flex-col h-full justify-center items-center w-full">
      <Form {...form}>
        <form
          onSubmit={onSubmit}
          className="flex flex-col md:flex-row justify-around gap-8 w-full"
        >
          <div className="flex flex-col justify-center items-center gap-y-4 w-full md:w-5/12">
            {form.formState.errors.root?.message && (
              <div className="w-full p-4 bg-khp-error/10 border border-khp-error/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-khp-error mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    {rootErrorLines?.map((line, idx) => (
                      <p
                        key={idx}
                        className={`text-sm ${idx === 0 ? "font-medium" : ""} text-khp-error`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {filePreview ? (
              <img
                src={filePreview}
                alt={form.watch("name") || "Preparation image"}
                className="aspect-square object-cover max-w-1/2 w-full my-6 rounded-md"
                onClick={() => inputRef.current?.click()}
              />
            ) : (
              <ImageAdd
                iconSize={32}
                onClick={() => inputRef.current?.click()}
              />
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
                    Preparation name <span className="text-red-500">*</span>
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
                      accept="image/jpeg, image/png, image/jpg"
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

            <div className="w-full grid grid-cols-1 md:grid-cols-2 mt-4 gap-x-2">
              <Button
                variant="khp-default"
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Updating..." : "Update"}
              </Button>
              <Button
                variant="khp-destructive"
                type="button"
                className="w-full"
                onClick={() => router.push(`/preparations/${id}`)}
                disabled={form.formState.isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>

          <div className="w-full">
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
                            {unitsSelections?.map((u) => (
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
                            {unitsSelections?.map((u) => (
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
                        <LoadMoreSelect
                          value={field.value}
                          onValueChange={field.onChange}
                          onOpenChange={(open) => {
                            if (!open) field.onBlur();
                          }}
                          triggerProps={{
                            ref: field.ref,
                            className: "w-full border-khp-primary",
                          }}
                          options={categoriesOptions}
                          placeholder="Select a category"
                          hasMore={hasMoreCategories}
                          loading={isCategoriesLoading}
                          onLoadMore={handleLoadMoreCategories}
                          emptyMessage="No categories found"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <PreparationEntitiesField
              form={form}
              hasErrors={form.formState.errors.entities}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
