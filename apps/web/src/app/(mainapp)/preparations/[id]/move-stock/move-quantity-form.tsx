"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import type { GetPreparationByIdQuery } from "@/graphql/generated/graphql";
import type { LocationRow } from "@/queries/locations-query";
import { QuantityInput } from "@workspace/ui/components/quantity-input";
import { LocationSelect } from "@workspace/ui/components/location-select";
import { movePreparationQuantityAction } from "../actions";

type PreparationData = NonNullable<GetPreparationByIdQuery["preparation"]>;

interface MoveQuantityFormProps {
  preparation: PreparationData;
  allLocations: LocationRow[];
}

interface FormData {
  sourceLocationIndex: string;
  destinationLocationIndex: string;
  quantityOTP: string;
}

export function MoveQuantityForm({
  preparation,
  allLocations,
}: MoveQuantityFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    sourceLocationIndex: "",
    destinationLocationIndex: "",
    quantityOTP: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const availableSourceQuantities = preparation.quantities.filter(
    (q) => q.quantity > 0,
  );

  const selectedSourceLocation = formData.sourceLocationIndex
    ? availableSourceQuantities.find(
        (q) => q.location.id === formData.sourceLocationIndex,
      )
    : null;

  const maxQuantity = selectedSourceLocation?.quantity || 0;

  const moveQuantity =
    !formData.quantityOTP || formData.quantityOTP.length === 0
      ? 0
      : parseFloat(formData.quantityOTP) || 0;

  const existingDestinations = preparation.quantities.filter(
    (q) => q.location.id !== selectedSourceLocation?.location.id,
  );

  const newDestinations = allLocations
    .filter(
      (loc) => !preparation.quantities.some((q) => q.location.id === loc.id),
    )
    .map((location) => ({
      quantity: 0,
      location: location,
    }));

  const destinationQuantities = [...existingDestinations, ...newDestinations];

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = (): string | null => {
    if (
      formData.quantityOTP &&
      formData.quantityOTP.trim() !== "" &&
      moveQuantity <= 0
    ) {
      return "Please enter a valid quantity";
    }
    if (moveQuantity > maxQuantity) {
      return `Quantity cannot exceed ${maxQuantity} ${preparation.unit}`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setApiError(null);

    const validationError = validateForm();
    if (validationError) {
      setApiError(validationError);
      setIsSubmitting(false);
      return;
    }

    if (!formData.sourceLocationIndex || !formData.destinationLocationIndex) {
      setApiError("Please select both source and destination locations");
      setIsSubmitting(false);
      return;
    }

    if (formData.sourceLocationIndex === formData.destinationLocationIndex) {
      setApiError("Source and destination locations must be different");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await movePreparationQuantityAction(preparation.id, {
        from_location_id: parseInt(formData.sourceLocationIndex),
        to_location_id: parseInt(formData.destinationLocationIndex),
        quantity: moveQuantity,
        unit: preparation.unit,
      });

      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push(`/preparations/${preparation.id}`);
          router.refresh();
        }, 2000);
      } else {
        setApiError(result.error || "Failed to move stock");
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
          Stock Moved Successfully!
        </h2>
        <p className="text-khp-text-secondary">
          {moveQuantity} {preparation.unit} moved from{" "}
          {selectedSourceLocation?.location.name} to destination location
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 ">
      <div className="space-y-2">
        <LocationSelect
          quantities={availableSourceQuantities}
          value={formData.sourceLocationIndex}
          onValueChange={(value) =>
            handleInputChange("sourceLocationIndex", value)
          }
          placeholder="Choose a source location"
          label="From"
          unit={preparation.unit}
          showAllOption={false}
        />
      </div>

      <QuantityInput
        title="Move"
        value={formData.quantityOTP}
        onChange={(value) => handleInputChange("quantityOTP", value)}
        unit={preparation.unit}
        disabled={!formData.sourceLocationIndex}
        placeholder="0"
      />

      <div className="space-y-2">
        <LocationSelect
          quantities={destinationQuantities}
          value={formData.destinationLocationIndex}
          onValueChange={(value) =>
            handleInputChange("destinationLocationIndex", value)
          }
          placeholder="Choose a destination location"
          label="To"
          unit={preparation.unit}
          showAllOption={false}
        />
      </div>

      <div className="border-khp-border pt-4">
        {apiError && (
          <div className="mb-4 p-3 bg-khp-error/10 border border-khp-error/30 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-khp-error" />
              <p className="text-sm text-khp-error font-medium">{apiError}</p>
            </div>
          </div>
        )}

        <div className="bg-khp-background-secondary p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-khp-text-secondary">
              Available Stock:
            </span>
            <span className="font-medium text-khp-text-primary">
              {maxQuantity} {preparation.unit}
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-khp-text-secondary">
              Move Quantity:
            </span>
            <span className="font-medium text-khp-primary">
              {moveQuantity.toFixed(3)} {preparation.unit}
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-khp-border">
            <span className="text-sm font-semibold text-khp-text-primary">
              Remaining:
            </span>
            <span className="font-bold text-khp-primary">
              {Math.max(0, maxQuantity - moveQuantity).toFixed(3)}{" "}
              {preparation.unit}
            </span>
          </div>
        </div>

        <Button
          type="submit"
          disabled={
            isSubmitting ||
            !formData.sourceLocationIndex ||
            !formData.destinationLocationIndex ||
            moveQuantity <= 0 ||
            moveQuantity > maxQuantity ||
            formData.sourceLocationIndex === formData.destinationLocationIndex
          }
          className="w-full mt-4"
          variant="khp-default"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              Moving Stock...
            </>
          ) : (
            `Move ${moveQuantity.toFixed(3)} ${preparation.unit}`
          )}
        </Button>
      </div>
    </form>
  );
}
