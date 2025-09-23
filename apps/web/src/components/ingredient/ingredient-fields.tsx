"use client";

import { useMemo } from "react";
import { UseFormReturn } from "react-hook-form";
import { useQuery } from "@apollo/client";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import { MultiSelect } from "@workspace/ui/components/multi-select";
import {
  GetMeasurementUnitsDocument,
  GetCategoriesDocument,
  GetAllergensDocument,
} from "@/graphql/generated/graphql";
import { createAllergenOptions } from "@workspace/ui/lib/allergens";

type EditIngredientFormData = {
  name: string;
  unit: string;
  category?: string;
  image_url?: string;
  base_quantity?: number;
  base_unit?: string;
  allergens?: string[];
  image_file?: File;
};

interface IngredientFieldsProps {
  form: UseFormReturn<EditIngredientFormData>;
}

export function IngredientFields({ form }: IngredientFieldsProps) {
  const { data: unitsData, loading: unitsLoading } = useQuery(
    GetMeasurementUnitsDocument,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const { data: categoriesData, loading: categoriesLoading } = useQuery(
    GetCategoriesDocument,
    {
      variables: {
        first: 50,
      },
      fetchPolicy: "cache-and-network",
    }
  );

  const { data: allergensData, loading: allergensLoading } = useQuery(
    GetAllergensDocument,
    {
      fetchPolicy: "cache-and-network",
    }
  );

  const unitOptions = useMemo(() => {
    if (!unitsData?.measurementUnits) return [];
    return unitsData.measurementUnits.map((unit) => ({
      value: unit.value,
      label: unit.label,
    }));
  }, [unitsData]);

  const categoryOptions = useMemo(() => {
    if (!categoriesData?.categories?.data) return [];
    return categoriesData.categories.data.map((category) => ({
      value: category.id,
      label: category.name,
    }));
  }, [categoriesData]);

  const allergenOptions = useMemo(() => {
    if (!allergensData?.allergens) return [];
    return createAllergenOptions(allergensData.allergens);
  }, [allergensData]);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-semibold text-khp-text-primary">
              Ingredient Name
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="Enter ingredient name"
                className="h-14 text-lg font-medium border-2 border-khp-primary/30 rounded-xl focus:ring-2 focus:ring-khp-primary/20 focus:border-khp-primary"
              />
            </FormControl>
            <FormMessage className="text-base" />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold text-khp-text-primary">
                Storage Unit
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={unitsLoading}
                >
                  <SelectTrigger className="min-h-12 h-12 p-2 rounded-md border-2 border-khp-primary/30 text-lg font-medium bg-inherit hover:bg-inherit focus:ring-2 focus:ring-khp-primary/20 focus:border-khp-primary touch-manipulation">
                    <SelectValue
                      placeholder={
                        unitsLoading ? "Loading units..." : "Select unit"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {unitOptions.map((unit) => (
                      <SelectItem
                        key={unit.value}
                        value={unit.value}
                        className="!h-12 !min-h-12 !py-3 !px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors touch-manipulation"
                      >
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage className="text-base" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold text-khp-text-primary">
                Category
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={(value) =>
                    field.onChange(value === "__clear__" ? "" : value)
                  }
                  value={field.value || "__clear__"}
                  disabled={categoriesLoading}
                >
                  <SelectTrigger className="min-h-12 h-12 p-2 rounded-md border-2 border-khp-primary/30 text-lg font-medium bg-inherit hover:bg-inherit focus:ring-2 focus:ring-khp-primary/20 focus:border-khp-primary touch-manipulation">
                    <SelectValue
                      placeholder={
                        categoriesLoading
                          ? "Loading categories..."
                          : "Select category"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    <SelectItem
                      value="__clear__"
                      className="!h-12 !min-h-12 !py-3 !px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors touch-manipulation"
                    >
                      Clear selection
                    </SelectItem>
                    {categoryOptions.map((category) => (
                      <SelectItem
                        key={category.value}
                        value={category.value}
                        className="!h-12 !min-h-12 !py-3 !px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors touch-manipulation"
                      >
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage className="text-base" />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="base_quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold text-khp-text-primary">
                Quantity for one portion
              </FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="h-14 text-lg font-medium border-2 border-khp-primary/30 rounded-xl focus:ring-2 focus:ring-khp-primary/20 focus:border-khp-primary"
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                />
              </FormControl>
              <FormMessage className="text-base" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="base_unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-lg font-semibold text-khp-text-primary">
                Portion Unit
              </FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={unitsLoading}
                >
                  <SelectTrigger className="min-h-12 h-12 p-2 rounded-md border-2 border-khp-primary/30 text-lg font-medium bg-inherit hover:bg-inherit focus:ring-2 focus:ring-khp-primary/20 focus:border-khp-primary touch-manipulation">
                    <SelectValue
                      placeholder={
                        unitsLoading ? "Loading units..." : "Select base unit"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {unitOptions.map((unit) => (
                      <SelectItem
                        key={unit.value}
                        value={unit.value}
                        className="!h-12 !min-h-12 !py-3 !px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors touch-manipulation"
                      >
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage className="text-base" />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="allergens"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-lg font-semibold text-khp-text-primary">
              Allergens
            </FormLabel>
            <FormControl>
              <MultiSelect
                options={allergenOptions}
                value={field.value || []}
                onValueChange={field.onChange}
                placeholder={
                  allergensLoading ? "Loading allergens..." : "Select allergens"
                }
                className="min-h-12 h-12 p-2 rounded-md border-2 border-khp-primary/30 text-lg font-medium bg-inherit hover:bg-inherit focus:ring-2 focus:ring-khp-primary/20 focus:border-khp-primary touch-manipulation"
                maxCount={2}
                compactMode={false}
                disabled={allergensLoading}
              />
            </FormControl>
            <FormMessage className="text-base" />
          </FormItem>
        )}
      />
    </div>
  );
}
