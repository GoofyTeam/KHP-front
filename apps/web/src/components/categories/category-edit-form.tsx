"use client";

import { useEffect, useState } from "react";
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
import {
  updateCategoryAction,
  type UpdateCategoryInput,
} from "@/app/(mainapp)/settings/categories/actions";
import type { Category } from "@/graphql/generated/graphql";
import {
  GetCategoriesDocument,
  GetLocationTypesDocument,
} from "@/graphql/generated/graphql";

interface CategoryEditFormProps {
  category: Category;
  onCategoryUpdated?: () => void;
}

export function CategoryEditForm({
  category,
  onCategoryUpdated,
}: CategoryEditFormProps) {
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
      name: category.name,
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
    formState: { isSubmitting, isSubmitSuccessful, errors },
    control,
    clearErrors,
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

  // Garder une trace des location types initiaux pour pouvoir envoyer null lors de la suppression
  const [initialLocationTypes, setInitialLocationTypes] = useState<string[]>(
    []
  );

  useEffect(() => {
    const shelfLives = category.shelfLives || [];
    const fridgeShelf = shelfLives.find(
      (sl) =>
        sl.locationType?.name?.toLowerCase() === "réfrigérateur" ||
        sl.locationType?.id === "2"
    );
    const freezerShelf = shelfLives.find(
      (sl) =>
        sl.locationType?.name?.toLowerCase() === "congélateur" ||
        sl.locationType?.id === "1"
    );

    const locationTypes = shelfLives
      .filter(
        (sl) =>
          sl.locationType &&
          sl.locationType.id !== "1" &&
          sl.locationType.id !== "2"
      )
      .map((sl) => ({
        location_type_id: sl.locationType!.id,
        days: Math.round((sl.shelf_life_hours || 0) / 24),
      }));

    // Sauvegarder les IDs des location types initiaux
    setInitialLocationTypes(locationTypes.map((lt) => lt.location_type_id));

    form.reset({
      name: category.name,
      shelf_lives: {
        fridge: fridgeShelf
          ? Math.round((fridgeShelf.shelf_life_hours || 0) / 24)
          : "",
        freezer: freezerShelf
          ? Math.round((freezerShelf.shelf_life_hours || 0) / 24)
          : "",
      },
      location_types: locationTypes,
    });
  }, [category, form]);

  const handleSubmit = async (values: CategoryFormValues) => {
    try {
      clearErrors("root");

      const transformedData: UpdateCategoryInput = {
        name: values.name.trim(),
      };

      // Gérer fridge et freezer séparément pour pouvoir envoyer null
      const fridgeValue =
        typeof values.shelf_lives.fridge === "string"
          ? values.shelf_lives.fridge === ""
            ? null
            : Number(values.shelf_lives.fridge)
          : values.shelf_lives.fridge;

      const freezerValue =
        typeof values.shelf_lives.freezer === "string"
          ? values.shelf_lives.freezer === ""
            ? null
            : Number(values.shelf_lives.freezer)
          : values.shelf_lives.freezer;

      // Ajouter les valeurs comme des location types individuels
      if (fridgeValue !== null) {
        transformedData["2"] = fridgeValue; // ID 2 pour réfrigérateur
      } else {
        transformedData["2"] = null; // Supprimer le shelf life du réfrigérateur
      }

      if (freezerValue !== null) {
        transformedData["1"] = freezerValue; // ID 1 pour congélateur
      } else {
        transformedData["1"] = null; // Supprimer le shelf life du congélateur
      }

      // Gérer les location types actuels du formulaire
      values.location_types
        .filter((lt) => lt.location_type_id)
        .forEach((lt) => {
          const days =
            typeof lt.days === "string"
              ? lt.days === ""
                ? null
                : Number(lt.days)
              : lt.days;

          // Envoyer null pour supprimer le shelf life, ou la valeur en jours
          transformedData[lt.location_type_id] = days;
        });

      // Envoyer null pour les location types qui étaient présents initialement mais qui ont été supprimés
      const currentLocationTypeIds = values.location_types
        .filter((lt) => lt.location_type_id)
        .map((lt) => lt.location_type_id);

      initialLocationTypes.forEach((initialId) => {
        if (!currentLocationTypeIds.includes(initialId)) {
          transformedData[initialId] = null; // Supprimer ce location type
        }
      });

      const result = await updateCategoryAction(category.id, transformedData);

      if (result.success) {
        await apolloClient.refetchQueries({
          include: [GetCategoriesDocument],
        });

        onCategoryUpdated?.();

        setTimeout(() => {
          clearErrors();
        }, 3000);
      } else {
        form.setError("root", {
          message: result.error || "Unable to update category",
        });
      }
    } catch (error) {
      console.error("Error updating category:", error);
      form.setError("root", {
        message: "Unable to update category. Please try again.",
      });
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col flex-1 space-y-5"
        >
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
                      placeholder="3"
                      onChange={(e) => field.onChange(e.target.value)}
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
                      placeholder="30"
                      onChange={(e) => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

          <div className="flex-shrink-0 pt-4">
            {isSubmitSuccessful ? (
              <div className="flex items-center justify-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                <span className="text-green-800 text-sm font-semibold">
                  Category updated successfully
                </span>
              </div>
            ) : errors.root ? (
              <div className="p-4 text-center border border-red-200 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                {errors.root.message}
              </div>
            ) : (
              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  variant="khp-default"
                  className="w-full h-12 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2Icon className="animate-spin h-4 w-4" />
                      Updating category...
                    </div>
                  ) : (
                    "Update Category"
                  )}
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
