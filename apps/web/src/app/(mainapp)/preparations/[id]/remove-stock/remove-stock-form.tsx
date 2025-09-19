"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { PackageMinus, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { QuantityInput } from "@workspace/ui/components/quantity-input";
import { LocationSelect } from "@workspace/ui/components/location-select";
import { GetPreparationByIdQuery } from "@/graphql/generated/graphql";
import { removePreparationQuantityAction } from "../actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@workspace/ui/components/form";

type PreparationData = NonNullable<GetPreparationByIdQuery["preparation"]>;

interface RemoveStockFormProps {
  preparation: PreparationData;
}

const removeStockSchema = z.object({
  selectedLocationIndex: z.string().min(1, "Please select a location"),
  removeQuantity: z.string().min(1, "Please enter a quantity"),
});

type RemoveStockFormData = z.infer<typeof removeStockSchema>;

export function RemoveStockForm({ preparation }: RemoveStockFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<RemoveStockFormData>({
    resolver: zodResolver(removeStockSchema),
    defaultValues: {
      selectedLocationIndex: "",
      removeQuantity: "",
    },
  });

  const availableLocations = preparation.quantities.filter(
    (q) => q.quantity > 0
  );

  const removeQuantityString = form.watch("removeQuantity");
  const removeQuantity =
    removeQuantityString && removeQuantityString.trim() !== ""
      ? parseFloat(removeQuantityString) || 0
      : 0;
  const selectedLocationId = form.watch("selectedLocationIndex");
  const selectedLocation = availableLocations.find(
    (q) => q.location.id === selectedLocationId
  );

  const maxQuantity = selectedLocation?.quantity || 0;

  const handleSubmit = async (data: RemoveStockFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      const quantity = parseFloat(data.removeQuantity);
      const locationId = parseInt(data.selectedLocationIndex);

      if (isNaN(quantity) || quantity <= 0) {
        setApiError("Please enter a valid quantity");
        return;
      }

      if (isNaN(locationId)) {
        setApiError("Please select a valid location");
        return;
      }

      if (quantity > maxQuantity) {
        setApiError(
          `Quantity cannot exceed ${maxQuantity} ${preparation.unit}`
        );
        return;
      }

      const result = await removePreparationQuantityAction(preparation.id, {
        location_id: locationId,
        quantity: quantity,
        unit: preparation.unit,
      });

      if (result.success) {
        setSuccess(true);
        form.reset();
        setTimeout(() => {
          router.push(`/preparations/${preparation.id}`);
          router.refresh();
        }, 1500);
      } else {
        setApiError(result.error || "An error occurred while removing stock");
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
          Stock Removed Successfully!
        </h2>
      </div>
    );
  }

  if (availableLocations.length === 0) {
    return (
      <div className="text-center space-y-4">
        <PackageMinus className="w-16 h-16 text-khp-text-secondary mx-auto" />
        <h2 className="text-xl font-bold text-khp-text-primary">
          No Stock Available
        </h2>
        <p className="text-khp-text-secondary">
          There is no stock available to remove for this preparation.
        </p>
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
                  quantities={availableLocations}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Choose location"
                  label="Location"
                  unit={preparation.unit}
                  showAllOption={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="removeQuantity"
          render={({ field }) => (
            <FormItem>
              <div className="border-khp-border pt-4">
                <FormControl>
                  <QuantityInput
                    value={field.value}
                    onChange={field.onChange}
                    unit={preparation.unit}
                    title="Remove Quantity"
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
              {preparation.unit}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-khp-text-secondary">
              Remove Quantity:
            </span>
            <span className="font-medium text-khp-warning">
              -{removeQuantity.toFixed(3)} {preparation.unit}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1 pt-1 border-t border-khp-border">
            <span className="text-sm font-semibold text-khp-text-primary">
              Remaining Stock:
            </span>
            <span className="font-bold text-khp-primary">
              {Math.max(
                0,
                (selectedLocation?.quantity || 0) - removeQuantity
              ).toFixed(3)}{" "}
              {preparation.unit}
            </span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !selectedLocationId ||
            removeQuantity <= 0 ||
            removeQuantity > maxQuantity
          }
          className="w-full"
          variant="khp-destructive"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Removing Stock...
            </>
          ) : (
            <>
              <PackageMinus className="w-4 h-4 mr-2" />
              Remove Stock
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
