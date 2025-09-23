"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { QuantityInput } from "@workspace/ui/components/quantity-input";
import { LocationSelect } from "@workspace/ui/components/location-select";
import { GetIngredientQuery } from "@/graphql/generated/graphql";
import { createLossAction } from "@/app/(mainapp)/loss/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@workspace/ui/components/form";
import lossReasons from "@/components/loss/loss-reasons.json";

type IngredientData = NonNullable<GetIngredientQuery["ingredient"]>;

interface LossFormProps {
  ingredient: IngredientData;
}

const lossFormSchema = z.object({
  selectedLocationIndex: z.string().min(1, "Please select a location"),
  lossQuantity: z.string().min(1, "Please enter a loss quantity"),
  reason: z.string().min(1, "Please select a reason for the loss"),
});

type LossFormData = z.infer<typeof lossFormSchema>;

export function LossForm({ ingredient }: LossFormProps) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const availableLocations = ingredient.quantities.filter(
    (q) => q.quantity > 0,
  );

  const form = useForm<LossFormData>({
    resolver: zodResolver(
      lossFormSchema.refine(
        (data) => {
          const selectedLocation = data.selectedLocationIndex
            ? availableLocations[parseInt(data.selectedLocationIndex)]
            : null;
          const lossQuantity = parseFloat(data.lossQuantity) || 0;

          if (selectedLocation && lossQuantity > selectedLocation.quantity) {
            return false;
          }
          return true;
        },
        {
          message: "Loss quantity cannot exceed available stock",
          path: ["lossQuantity"],
        },
      ),
    ),
    defaultValues: {
      selectedLocationIndex: "",
      lossQuantity: "",
      reason: "",
    },
  });

  const {
    watch,
    formState: { isSubmitting },
  } = form;
  const watchedValues = watch();

  const selectedLocation = watchedValues.selectedLocationIndex
    ? availableLocations.find(
        (loc) => loc.location.id === watchedValues.selectedLocationIndex,
      )
    : null;
  const lossQuantity = parseFloat(watchedValues.lossQuantity) || 0;
  const hasExcessiveLoss =
    selectedLocation && lossQuantity > selectedLocation.quantity;

  const handleSubmit = async (data: LossFormData) => {
    if (!selectedLocation) return;

    setApiError(null);

    try {
      const trackableId = parseInt(ingredient.id);
      const locationId = parseInt(selectedLocation.location.id);
      const quantity = Number(lossQuantity.toFixed(3));
      const reason = data.reason.trim();

      // Validation des données avant envoi
      if (isNaN(trackableId)) {
        setApiError("Invalid ingredient ID");
        return;
      }
      if (isNaN(locationId)) {
        setApiError("Invalid location ID");
        return;
      }
      if (isNaN(quantity) || quantity <= 0) {
        setApiError("Invalid quantity");
        return;
      }
      if (!reason) {
        setApiError("Reason is required");
        return;
      }

      const lossData = {
        loss_item_id: trackableId,
        loss_item_type: "ingredient" as const,
        location_id: locationId,
        quantity: quantity,
        reason: reason,
      };

      const result = await createLossAction(lossData);

      if (result.success) {
        setSuccess(true);
        form.reset();

        setTimeout(() => {
          router.push(`/ingredient/${ingredient.id}`);
        }, 2000);
      } else {
        setApiError(result.error || "Error while saving the loss");
      }
    } catch {
      setApiError("Connection error");
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-khp-text-primary mb-2">
          Loss recorded successfully!
        </h3>
        <p className="text-khp-text-secondary mb-4">
          The loss was recorded successfully.
        </p>
        <p className="text-sm text-khp-text-secondary">Redirection...</p>
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
                  unit={ingredient.unit}
                  showAllOption={false}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <div className="space-y-2">
                <FormLabel className="text-base font-semibold text-khp-text-primary">
                  Reason
                </FormLabel>
                <FormControl>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all">
                      <SelectValue placeholder="Choose a reason for the loss" />
                    </SelectTrigger>
                    <SelectContent className="max-h-72">
                      {lossReasons.map((reason) => (
                        <SelectItem
                          key={reason.value}
                          value={reason.value}
                          className="!h-14 !min-h-14 !py-4 !px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors touch-manipulation"
                        >
                          <span className="font-medium text-khp-text-primary">
                            {reason.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lossQuantity"
          render={({ field }) => (
            <FormItem>
              <div className="border-khp-border pt-4">
                <FormControl>
                  <QuantityInput
                    value={field.value}
                    onChange={field.onChange}
                    unit={ingredient.unit}
                    title="Loss Quantity"
                    autoFocus={!!selectedLocation}
                    disabled={!selectedLocation}
                    className={!selectedLocation ? "opacity-60" : ""}
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
              Loss Quantity:
            </span>
            <span className="font-medium text-khp-warning">
              -{lossQuantity.toFixed(3)} {ingredient.unit}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1 pt-1 border-t border-khp-border">
            <span className="text-sm font-medium text-khp-text-primary">
              After Loss:
            </span>
            <span
              className={`font-bold ${selectedLocation && selectedLocation.quantity - lossQuantity < 0 ? "text-khp-error" : "text-khp-primary"}`}
            >
              {selectedLocation
                ? Math.max(0, selectedLocation.quantity - lossQuantity).toFixed(
                    3,
                  )
                : (0 - lossQuantity).toFixed(3)}{" "}
              {ingredient.unit}
            </span>
          </div>
        </div>

        <div>
          {hasExcessiveLoss && selectedLocation ? (
            <div className="w-full p-4 bg-khp-error/10 border border-khp-error/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-khp-error mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-khp-error">
                    Cannot add loss - exceeds available stock
                  </p>
                  <p className="text-xs text-khp-error/80 mt-1">
                    You cannot lose more than {selectedLocation.quantity}{" "}
                    {ingredient.unit} available in{" "}
                    {selectedLocation.location.name}.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <Button
              type="submit"
              variant="destructive"
              size="xl"
              className="w-full py-4 px-6 text-base font-semibold"
              disabled={
                !form.formState.isValid || isSubmitting || !!hasExcessiveLoss
              }
            >
              <Trash2 className="w-5 h-5 mr-3" />
              {isSubmitting ? "Recording Loss..." : "Add Loss"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
