"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
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
import { AlertCircle } from "lucide-react";
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
import { getAllMeasurementUnitsOnlyValues } from "@/lib/mesurmentsUnit";
import { Label } from "@workspace/ui/components/label";
import { createPreparationAction } from "@/app/(mainapp)/preparations/add/action";

const preparationItemsSchema = z.object({
  id: z.string().nonempty(),
  type: z.enum(["ingredient", "preparation"]),
  quantity: z
    .number({ invalid_type_error: "Quantity is required" })
    .positive("Quantity must be a positive number"),
  unit: z.string().nonempty("Unit is required"),
  location_id: z.string().nonempty("Location is required"),
});

const createMenuSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters long"),
    image: z
      .instanceof(File)
      .optional()
      .refine((file) => {
        if (!file) return true; // image is optional
        const validTypes = ["image/jpeg", "image/png", "image/jpg"];
        const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
        return validTypes.includes(file.type) && file.size <= maxSizeInBytes;
      }, "Image must be a JPEG or PNG file and less than 1MB"),
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

const CATEGORY_PAGE_SIZE = 20;

export default function CreatePreparationPage() {
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

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

  const categoriesOptions = useMemo(() => {
    const nodes = ingredientCategories?.categories?.data ?? [];
    return nodes.map((category) => ({
      value: category.id,
      label: category.name,
    }));
  }, [ingredientCategories?.categories?.data]);

  const categoriesPaginator = ingredientCategories?.categories?.paginatorInfo;
  const hasMoreCategories = categoriesPaginator?.hasMorePages ?? false;
  const currentCategoryPage = categoriesPaginator?.currentPage ?? 1;
  const isFetchingMoreCategories =
    categoriesNetworkStatus === NetworkStatus.fetchMore;

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
    defaultValues: {
      name: "",
      image: undefined,
      unit: undefined,
      base_quantity: undefined,
      base_unit: undefined,
      category_id: "1",
      entities: [],
    },
  });

  const unitsSelections = useMemo(getAllMeasurementUnitsOnlyValues, []);

  async function onPreparationCreateSubmit(values: CreateMenuFormValues) {
    const res = await createPreparationAction(values);

    if (res.success) {
      router.push("/preparations");
      return;
    }

    console.error("Failed to create preparation:", res.error, res.details);

    let message = "An error occurred while creating the preparation.";
    const detailMessage = (() => {
      try {
        if (res && typeof res === "object") {
          const anyRes = res as unknown as {
            details?: unknown;
            error?: string;
          };
          if (
            anyRes.details &&
            typeof anyRes.details === "object" &&
            "message" in (anyRes.details as Record<string, unknown>) &&
            typeof (anyRes.details as { message?: unknown }).message ===
              "string"
          ) {
            return (anyRes.details as { message: string }).message;
          }
          if (typeof anyRes.error === "string" && anyRes.error.trim()) {
            return anyRes.error;
          }
        }
      } catch {}
      return null;
    })();

    if (detailMessage) {
      message = detailMessage;
    }

    const tips: string[] = [];
    const lower = message.toLowerCase();
    if (lower.includes("authentication") || lower.includes("unauthorized")) {
      tips.push("You must be authenticated. Please sign in again.");
    }
    if (lower.includes("session expired") || lower.includes("419")) {
      tips.push("Your session has expired. Refresh the page, then try again.");
    }
    if (lower.includes("validation") || lower.includes("422")) {
      tips.push("Fix the fields with errors, then submit again.");
    }
    if (tips.length === 0) {
      tips.push(
        "Check required fields, image format/size, and your network connection."
      );
    }

    const combinedMessage = [message, ...tips].join("\n");

    form.setError("root", {
      type: "server",
      message: combinedMessage,
    });
  }

  return (
    <div className="flex flex-col h-full justify-center items-center w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onPreparationCreateSubmit)}
          className="flex flex-col md:flex-row justify-around gap-8 w-full"
        >
          <div className="flex flex-col justify-center items-center gap-y-4 w-full md:w-5/12">
            {form.formState.errors.root?.message && (
              <div className="w-full p-4 bg-khp-error/10 border border-khp-error/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-khp-error mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    {form.formState.errors.root.message
                      .split("\n")
                      .map((line, idx) => (
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
                src={filePreview || ""}
                alt={"Menu Image"}
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
                      max={1048576}
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

            <div className="w-full grid grid-cols-1 md:grid-cols-2 mt-4 gap-x-2">
              <Button variant="khp-default" type="submit" className="w-full">
                Create
              </Button>
              <Button
                variant="khp-destructive"
                type="button"
                className="w-full"
                onClick={() => router.push("/preparations")}
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
                        Storage unit <span className="text-red-500">*</span>
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
                          loading={
                            categoriesLoading || isFetchingMoreCategories
                          }
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
