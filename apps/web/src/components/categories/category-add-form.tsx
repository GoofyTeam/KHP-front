"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useApolloClient, useQuery } from "@apollo/client";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { CheckCircleIcon, Loader2Icon, Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { createCategoryAction } from "@/app/(mainapp)/settings/categories/actions";
import {
  GetCategoriesDocument,
  GetLocationTypesDocument,
  type Category,
} from "@/graphql/generated/graphql";

interface CategoryAddFormProps {
  onCategoryAdded?: () => void;
}

export function CategoryAddForm({ onCategoryAdded }: CategoryAddFormProps) {
  const apolloClient = useApolloClient();

  const { data: locationTypesData, loading: locationTypesLoading } = useQuery(
    GetLocationTypesDocument,
    {
      fetchPolicy: "cache-and-network",
      errorPolicy: "all",
    }
  );

  const locationTypes = locationTypesData?.locationTypes?.data || [];

  type CategoryFormValues = {
    name: string;
    shelf_lives: {
      fridge: string | number;
      freezer: string | number;
    };
    location_types: {
      location_type_id: string;
      days: string | number;
    }[];
  };

  const form = useForm<CategoryFormValues>({
    defaultValues: {
      name: "",
      shelf_lives: {
        fridge: "",
        freezer: "",
      },
      location_types: [],
    },
    mode: "onBlur",
    reValidateMode: "onChange",
    criteriaMode: "all",
  });

  const {
    formState: { isSubmitting, isSubmitSuccessful, errors, isValid, isDirty },
    setError,
    reset,
    clearErrors,
    control,
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "location_types",
  });

  const getAvailableLocationTypes = (currentIndex: number) => {
    const selectedIds = fields
      .map((field, index) =>
        index !== currentIndex ? field.location_type_id : null
      )
      .filter((id): id is string => id !== null && id !== "");

    return locationTypes.filter(
      (locationType) =>
        !selectedIds.includes(locationType.id) &&
        locationType.id !== "1" && // Exclure congélateur
        locationType.id !== "2" // Exclure réfrigérateur
    );
  };

  const hasAvailableLocationTypes = () => {
    const selectedIds = fields
      .map((field) => field.location_type_id)
      .filter((id): id is string => id !== null && id !== "");

    // Compter les location types disponibles (en excluant fridge et freezer)
    const availableLocationTypes = locationTypes.filter(
      (locationType) =>
        locationType.id !== "1" && // Exclure congélateur
        locationType.id !== "2" // Exclure réfrigérateur
    );

    return availableLocationTypes.length > selectedIds.length;
  };

  const handleSuccess = async (result: {
    success: boolean;
    data?: Category;
    error?: string;
  }) => {
    reset();
    clearErrors();

    try {
      const existingData = apolloClient.readQuery({
        query: GetCategoriesDocument,
        variables: { first: 10, page: 1 },
      });

      if (existingData?.categories?.data && result.data) {
        apolloClient.writeQuery({
          query: GetCategoriesDocument,
          variables: { first: 10, page: 1 },
          data: {
            categories: {
              ...existingData.categories,
              data: [result.data, ...existingData.categories.data],
            },
          },
        });
      }
    } catch {
      await apolloClient.refetchQueries({
        include: [GetCategoriesDocument],
      });
    }

    onCategoryAdded?.();
  };

  const onSubmit = form.handleSubmit(async (values: CategoryFormValues) => {
    try {
      clearErrors("root");

      const transformedData = {
        name: values.name.trim(),
        shelf_lives: {
          fridge:
            typeof values.shelf_lives.fridge === "string"
              ? values.shelf_lives.fridge === ""
                ? 0
                : Number(values.shelf_lives.fridge)
              : values.shelf_lives.fridge,
          freezer:
            typeof values.shelf_lives.freezer === "string"
              ? values.shelf_lives.freezer === ""
                ? 0
                : Number(values.shelf_lives.freezer)
              : values.shelf_lives.freezer,
        },
        location_types: values.location_types
          .map((lt) => ({
            location_type_id: lt.location_type_id,
            days:
              typeof lt.days === "string"
                ? lt.days === ""
                  ? 0
                  : Number(lt.days)
                : lt.days,
          }))
          .filter((lt) => lt.location_type_id && lt.days > 0),
      };

      const result = await createCategoryAction(transformedData);

      if (result.success) {
        await handleSuccess(result);

        setTimeout(() => {
          clearErrors();
        }, 3000);
      } else {
        setError("root", {
          message: result.error || "Unable to create category",
          type: "server",
        });
      }
    } catch (error) {
      console.error("Error creating category:", error);
      setError("root", {
        message: "Unable to create category. Please try again.",
        type: "network",
      });
    }
  });

  return (
    <div className="flex-1 flex flex-col h-full">
      <Form {...form}>
        <form onSubmit={onSubmit} className="flex flex-col flex-1 space-y-5">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-khp-text-primary">
                  Category Name
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isSubmitting}
                    className="w-full h-12 text-base border-khp-border focus:border-khp-primary focus:ring-2 focus:ring-khp-primary/20 transition-all px-4 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary rounded-lg"
                    placeholder="Enter category name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Shelf Lives Section */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="shelf_lives.fridge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-khp-text-primary">
                    Fridge Shelf Life (days)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      max="365"
                      disabled={isSubmitting}
                      className="w-full h-12 text-base border-khp-border focus:border-khp-primary focus:ring-2 focus:ring-khp-primary/20 transition-all px-4 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary rounded-lg"
                      placeholder="Enter days"
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shelf_lives.freezer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold text-khp-text-primary">
                    Freezer Shelf Life (days)
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      min="1"
                      max="3650"
                      disabled={isSubmitting}
                      className="w-full h-12 text-base border-khp-border focus:border-khp-primary focus:ring-2 focus:ring-khp-primary/20 transition-all px-4 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary rounded-lg"
                      placeholder="Enter days"
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Section des types de location */}
          <div className="space-y-4 mb-0">
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-lg font-semibold text-khp-text-primary">
                Location Types (Optional)
              </h3>
              <Button
                type="button"
                onClick={() => append({ location_type_id: "", days: "" })}
                variant="ghost"
                size="sm"
                className="text-khp-primary hover:bg-khp-primary/10"
                disabled={
                  isSubmitting ||
                  locationTypesLoading ||
                  !hasAvailableLocationTypes()
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Add location type
              </Button>
            </div>

            {fields.length > 0 && (
              <div className="overflow-y-auto h-62 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-end gap-2 p-3 border border-khp-border rounded-lg bg-gray-50/50"
                    >
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name={`location_types.${index}.location_type_id`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-khp-text-primary">
                                Location Type
                              </FormLabel>
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                  disabled={
                                    isSubmitting || locationTypesLoading
                                  }
                                >
                                  <SelectTrigger className="w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all">
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-72">
                                    {getAvailableLocationTypes(index).map(
                                      (locationType) => (
                                        <SelectItem
                                          key={locationType.id}
                                          value={locationType.id}
                                          className="!h-14 !min-h-14 !py-4 !px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors touch-manipulation"
                                        >
                                          <div className="flex flex-col w-full">
                                            <span className="font-medium text-khp-text-primary">
                                              {locationType.name}
                                            </span>
                                          </div>
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`location_types.${index}.days`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs font-medium text-khp-text-primary">
                                Days
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min="1"
                                  max="3650"
                                  disabled={isSubmitting}
                                  className="w-full h-14 text-base border-khp-primary focus:border-khp-primary focus:ring-2 focus:ring-khp-primary/20 transition-all px-4 font-medium disabled:bg-khp-background-secondary disabled:text-khp-text-secondary rounded-lg touch-manipulation"
                                  placeholder="Days"
                                  onChange={(e) => {
                                    field.onChange(e.target.value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={() => remove(index)}
                        variant="ghost"
                        size="sm"
                        className="h-14 w-14 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0 touch-manipulation"
                        disabled={isSubmitting}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {fields.length === 0 && (
              <div className="h-62 flex items-center justify-center">
                <p className="text-sm text-khp-text-secondary italic text-center">
                  {hasAvailableLocationTypes()
                    ? 'No location types added yet. Click "Add location type" to specify custom shelf lives for different location types.'
                    : "All available location types have been used."}
                </p>
              </div>
            )}
          </div>

          <div className="pt-4">
            {isSubmitSuccessful ? (
              <div className="flex items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-green-800 text-sm font-semibold">
                  Category created successfully
                </span>
              </div>
            ) : errors.root ? (
              <div className="p-4 text-center border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                {errors.root.message}
              </div>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting || !isValid || !isDirty}
                variant="khp-default"
                className="w-full h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2Icon className="animate-spin h-4 w-4" />
                    Creating category...
                  </div>
                ) : (
                  "Create Category"
                )}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
