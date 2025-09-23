"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { PackagePlus, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { QuantityInput } from "@workspace/ui/components/quantity-input";
import { LocationSelect } from "@workspace/ui/components/location-select";
import { GetIngredientQuery } from "@/graphql/generated/graphql";
import { addIngredientQuantityAction } from "@/app/(mainapp)/ingredient/actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";

type IngredientData = NonNullable<GetIngredientQuery["ingredient"]>;

interface AddStockFormProps {
  ingredient: IngredientData;
}

const addStockSchema = z.object({
  selectedLocationIndex: z.string().min(1, "Please select a location"),
  addQuantity: z.string().min(1, "Please enter a quantity"),
});

type AddStockFormData = z.infer<typeof addStockSchema>;

export function AddStockForm({ ingredient }: AddStockFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<AddStockFormData>({
    resolver: zodResolver(addStockSchema),
    defaultValues: {
      selectedLocationIndex: "",
      addQuantity: "",
    },
  });

  const existingLocations = ingredient.quantities.map((q) => ({
    quantity: q.quantity,
    location: q.location,
  }));

  const addQuantityString = form.watch("addQuantity");
  const addQuantity =
    addQuantityString && addQuantityString.trim() !== ""
      ? parseFloat(addQuantityString) || 0
      : 0;
  const selectedLocationId = form.watch("selectedLocationIndex");
  const selectedLocation = existingLocations.find(
    (q) => q.location.id === selectedLocationId,
  );

  const handleSubmit = async (data: AddStockFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const quantity = parseFloat(data.addQuantity);
      const locationId = parseInt(data.selectedLocationIndex);

      if (isNaN(quantity) || quantity <= 0) {
        setApiError("Please enter a valid quantity");
        return;
      }

      if (isNaN(locationId)) {
        setApiError("Please select a valid location");
        return;
      }

      const result = await addIngredientQuantityAction(ingredient.id, {
        location_id: locationId,
        quantity: quantity,
        unit: ingredient.unit,
      });

      if (result.success) {
        setSuccess(true);
        form.reset();
        setTimeout(() => {
          router.push(`/ingredient/${ingredient.id}`);
          router.refresh();
        }, 1500);
      } else {
        setApiError(result.error || "An error occurred while adding stock");
      }
    } catch {
      setApiError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
        <h2 className="text-2xl font-bold text-khp-text-primary">
          Stock Added Successfully!
        </h2>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {apiError && (
          <div className="bg-khp-error/10 border border-khp-error/30 text-khp-error text-sm p-3 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-khp-error mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{apiError}</p>
              </div>
            </div>
          </div>
        )}

        <FormField
          control={form.control}
          name="selectedLocationIndex"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <LocationSelect
                  quantities={existingLocations}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Choose location"
                  label="Location"
                  unit={ingredient.unit}
                  showAllOption={false}
                  hideEmptyLocations={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="addQuantity"
          render={({ field }) => (
            <FormItem>
              <div className="border-khp-border pt-4">
                <FormControl>
                  <QuantityInput
                    value={field.value}
                    onChange={field.onChange}
                    unit={ingredient.unit}
                    title="Add Quantity"
                    autoFocus={!!selectedLocationId}
                    disabled={!selectedLocationId}
                    className={!selectedLocationId ? "opacity-60" : ""}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="mt-4 p-3 bg-khp-background-secondary rounded-lg border border-khp-border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-khp-text-secondary">
              Current Stock{" "}
              {selectedLocation ? `(${selectedLocation.location.name})` : ""}:
            </span>
            <span className="font-medium text-khp-text-primary">
              {selectedLocation ? selectedLocation.quantity : 0}{" "}
              {ingredient.unit}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-khp-text-secondary">
              Add Quantity:
            </span>
            <span className="font-medium text-green-600">
              +{addQuantity.toFixed(3)} {ingredient.unit}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1 pt-1 border-t border-khp-border">
            <span className="text-sm font-semibold text-khp-text-primary">
              New Stock:
            </span>
            <span className="font-bold text-khp-primary">
              {((selectedLocation?.quantity || 0) + addQuantity).toFixed(3)}{" "}
              {ingredient.unit}
            </span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting || !selectedLocationId || addQuantity <= 0}
          className="w-full"
          variant="khp-default"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Adding Stock...
            </>
          ) : (
            <>
              <PackagePlus className="w-4 h-4 mr-2" />
              Add Stock
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
