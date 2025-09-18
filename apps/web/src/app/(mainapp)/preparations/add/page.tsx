"use client";

import { z } from "zod";
import { SubmitErrorHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useCallback, useMemo, useRef, useState } from "react";
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
import { PreparationEntitiesField } from "@/components/preparation/PreparationEntitiesField";
import { Button } from "@workspace/ui/components/button";
import { AlertCircle, CookingPot, Package } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@workspace/ui/components/select";
import { LoadMoreSelect } from "@workspace/ui/components/load-more-select";

import { NetworkStatus, useQuery } from "@apollo/client";
import {
  GetCategoriesDocument,
  GetCategoriesQuery,
} from "@/graphql/generated/graphql";
import { getAllMeasurementUnitsOnlyValues } from "@workspace/ui/lib/measurement-units";
import { Label } from "@workspace/ui/components/label";
import { createPreparationAction } from "@/app/(mainapp)/preparations/add/action";
import { Tabs, TabsContent } from "@workspace/ui/components/tabs";

const preparationItemsSchema = z.object({
  id: z.string().nonempty(),
  type: z.enum(["ingredient", "preparation"]),
  quantity: z
    .number({ invalid_type_error: "Quantity is required" })
    .positive("Quantity must be a positive number"),
  unit: z.string().nonempty("Unit is required"),
  location_id: z.string().nonempty("Location is required"),
});

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"] as const;

const createMenuSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    image: z
      .instanceof(File, {
        message: "Menu image is required",
      })
      .refine((file) => {
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
        return !isNaN(num) && num > 0;
      }, "Base quantity must be a positive number"),
    base_unit: z.string().nonempty("Base unit is required"),
    category_id: z
      .string()
      .refine((val) => !isNaN(Number(val)), "Category is required"),
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
          path: ["items", index, "quantity"],
        });
      }
    });
  });

export type CreateMenuFormValues = z.infer<typeof createMenuSchema>;

const PREPARATION_DETAILS_FIELDS = [
  "name",
  "image",
  "unit",
  "base_quantity",
  "base_unit",
  "category_id",
] as const satisfies ReadonlyArray<keyof CreateMenuFormValues>;

type CreatePreparationActionResult = Awaited<
  ReturnType<typeof createPreparationAction>
>;

const DEFAULT_FORM_VALUES: Partial<CreateMenuFormValues> = {
  name: "",
  image: undefined,
  unit: undefined,
  base_quantity: undefined,
  base_unit: undefined,
  category_id: "1",
  entities: [],
};

function buildSubmissionErrorMessage(result: CreatePreparationActionResult) {
  const fallbackMessage = "An error occurred while creating the preparation.";

  const detailedMessage = (() => {
    try {
      if (!result || typeof result !== "object") {
        return null;
      }

      if (
        "details" in result &&
        result.details &&
        typeof result.details === "object" &&
        "message" in (result.details as Record<string, unknown>)
      ) {
        const message = (result.details as { message?: unknown }).message;
        if (typeof message === "string" && message.trim()) {
          return message;
        }
      }

      if (
        "error" in result &&
        typeof result.error === "string" &&
        result.error.trim()
      ) {
        return result.error;
      }
    } catch (error) {
      console.error("Failed to extract submission error message", error);
    }

    return null;
  })();

  const message = detailedMessage ?? fallbackMessage;
  const lowerCaseMessage = message.toLowerCase();

  const tips: string[] = [];
  if (
    lowerCaseMessage.includes("authentication") ||
    lowerCaseMessage.includes("unauthorized")
  ) {
    tips.push("You must be authenticated. Please sign in again.");
  }
  if (
    lowerCaseMessage.includes("session expired") ||
    lowerCaseMessage.includes("419")
  ) {
    tips.push("Your session has expired. Refresh the page, then try again.");
  }
  if (
    lowerCaseMessage.includes("validation") ||
    lowerCaseMessage.includes("422")
  ) {
    tips.push("Fix the fields with errors, then submit again.");
  }
  if (tips.length === 0) {
    tips.push(
      "Check required fields, image format/size, and your network connection."
    );
  }

  return [message, ...tips].join("\n");
}

const CATEGORY_PAGE_SIZE = 20;

export default function CreatePreparationPage() {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("details");

  const {
    data: ingredientCategories,
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

  const categoriesData = ingredientCategories?.categories?.data;
  const categoriesOptions = useMemo(() => {
    if (!categoriesData) {
      return [];
    }

    return categoriesData.map((category) => ({
      value: category.id,
      label: category.name,
    }));
  }, [categoriesData]);

  const categoriesPaginator = ingredientCategories?.categories?.paginatorInfo;
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

  const form = useForm<CreateMenuFormValues>({
    resolver: zodResolver(createMenuSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const handleValidationErrors: SubmitErrorHandler<CreateMenuFormValues> = (
    errors
  ) => {
    const hasDetailErrors = PREPARATION_DETAILS_FIELDS.some((field) =>
      Boolean(errors[field])
    );

    if (hasDetailErrors) {
      setActiveTab("details");
      return;
    }

    if (errors.entities) {
      setActiveTab("ingredients");
    }
  };

  const unitsSelections = useMemo(getAllMeasurementUnitsOnlyValues, []);

  const handleImageChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>, onChange: (file?: File) => void) => {
      const file = event.target.files?.[0];

      if (!file) {
        setFilePreview(null);
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
    [setFilePreview]
  );

  async function onPreparationCreateSubmit(values: CreateMenuFormValues) {
    const result = await createPreparationAction(values);

    if (result.success) {
      router.push("/preparations");
      return;
    }

    console.error(
      "Failed to create preparation:",
      result.error,
      result.details
    );

    form.setError("root", {
      type: "server",
      message: buildSubmissionErrorMessage(result),
    });
  }

  const rootErrorLines = form.formState.errors.root?.message
    ?.split("\n")
    .filter(Boolean);

  return (
    <div className="w-full p-4 lg:p-6">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            onPreparationCreateSubmit,
            handleValidationErrors
          )}
          className="w-full max-w-6xl mx-auto"
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="w-full max-w-4xl mx-auto mb-10">
              <div className="relative bg-gray-50 rounded-2xl p-2 shadow-sm border border-gray-200">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    onClick={() => setActiveTab("details")}
                    variant={
                      activeTab === "details" ? "khp-solid" : "khp-outline"
                    }
                    className="transition-colors"
                  >
                    <CookingPot className="w-5 h-5 transition-colors" />
                    <span className="text-sm font-semibold">
                      Preparation informations
                    </span>
                  </Button>

                  <Button
                    type="button"
                    variant={
                      activeTab === "ingredients" ? "khp-solid" : "khp-outline"
                    }
                    onClick={() => setActiveTab("ingredients")}
                    className="transition-colors"
                  >
                    <Package className="w-5 h-5 transition-colors" />
                    <span className="text-sm font-semibold">Ingredients</span>
                  </Button>
                </div>
              </div>
            </div>

            <TabsContent value="details" className="mt-0">
              <div className="w-full max-w-4xl mx-auto flex flex-col min-h-[600px]">
                <div className="flex-1 space-y-6">
                  {filePreview ? (
                    <img
                      src={filePreview || ""}
                      alt={"Menu Image"}
                      className="aspect-square object-cover max-w-1/2 w-full my-6 rounded-md mx-auto"
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
                          Preparation name{" "}
                          <span className="text-red-500">*</span>
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
                            ref={(e: HTMLInputElement | null) => {
                              ref(e);
                              inputRef.current = e;
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
                              <Input
                                {...field}
                                className="border-khp-primary"
                              />
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
                                defaultValue={field.value}
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
                              Storage unit{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
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
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ingredients" className="mt-0">
              <div className="w-full max-w-4xl mx-auto flex flex-col min-h-[600px]">
                <div className="flex-1">
                  <PreparationEntitiesField
                    form={form}
                    hasErrors={form.formState.errors.entities}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {form.formState.errors.root?.message && (
            <div className="w-full max-w-4xl mx-auto flex flex-col min-h-[600px]">
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
            </div>
          )}

          <div className="w-full max-w-4xl mx-auto mt-4">
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm">
              {activeTab === "details" && (
                <Button
                  variant="khp-default"
                  type="button"
                  onClick={() => setActiveTab("ingredients")}
                  className="flex-1"
                  disabled={form.formState.isSubmitting}
                >
                  Next: Ingredients
                </Button>
              )}

              {activeTab === "ingredients" && (
                <Button
                  variant="khp-default"
                  type="submit"
                  className="flex-1"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? "Updating..."
                    : "Create preparation"}
                </Button>
              )}

              <Button
                variant="khp-destructive"
                type="button"
                className="flex-1"
                onClick={() => router.push("/preparations")}
              >
                Cancel
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
