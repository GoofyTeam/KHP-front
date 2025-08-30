"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import type { Ingredient, Location } from "../types/stocks";
import { LocationSelect } from "@workspace/ui/components/location-select";
import { QuantityInput } from "@workspace/ui/components/quantity-input";

interface MoveQuantityFormProps {
  ingredient: Ingredient;
  allLocations: Location[];
}

interface FormData {
  sourceLocationIndex: string;
  destinationLocationIndex: string;
  quantityOTP: string;
}

export function MoveQuantityForm({
  ingredient,
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

  const availableSourceQuantities = ingredient.quantities.filter(
    (q) => q.quantity > 0
  );

  const selectedSourceLocation = formData.sourceLocationIndex
    ? availableSourceQuantities[parseInt(formData.sourceLocationIndex)]
    : null;

  const maxQuantity = selectedSourceLocation?.quantity || 0;

  const moveQuantity =
    !formData.quantityOTP || formData.quantityOTP.length === 0
      ? 0
      : parseFloat(formData.quantityOTP) || 0;

  const existingDestinations = ingredient.quantities.filter(
    (q) => q.location.id !== selectedSourceLocation?.location.id
  );

  const newDestinations = allLocations
    .filter(
      (loc) => !ingredient.quantities.some((q) => q.location.id === loc.id)
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
    // Only show quantity error if user has entered something invalid (not just empty/0)
    if (
      formData.quantityOTP &&
      formData.quantityOTP.trim() !== "" &&
      moveQuantity <= 0
    ) {
      return "Please enter a valid quantity";
    }
    if (moveQuantity > maxQuantity) {
      return `Quantity cannot exceed ${maxQuantity} ${ingredient.unit}`;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);

      setTimeout(() => {
        router.push(`/ingredient/${ingredient.id}`);
      }, 2000);
    } catch (err) {
      console.error("Error moving quantity:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-khp-text-primary mb-2">
          Move Successful!
        </h3>
        <p className="text-khp-text-secondary mb-4">
          The quantity has been transferred successfully.
        </p>
        <p className="text-sm text-khp-text-secondary">Redirecting...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 ">
      <div className="space-y-2">
        {/*  <LocationSelect
          quantities={availableSourceQuantities}
          value={formData.sourceLocationIndex}
          onValueChange={(value) =>
            handleInputChange("sourceLocationIndex", value)
          }
          placeholder="Choose a source location"
          label="From"
          unit={ingredient.unit}
        /> */}
        <LocationSelect
          quantities={ingredient.quantities}
          value={formData.sourceLocationIndex}
          onValueChange={(value) =>
            handleInputChange("sourceLocationIndex", value)
          }
          placeholder="Choose a source location"
          label="From"
          unit={ingredient.unit}
          hideEmptyLocations={false}
          showAllOption={true}
          allOptionLabel="All locations"
          displayAllQuantity={true}
        />
      </div>

      <QuantityInput
        title="Move"
        value={formData.quantityOTP}
        onChange={(value) => handleInputChange("quantityOTP", value)}
        unit={ingredient.unit}
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
          unit={ingredient.unit}
          hideEmptyLocations={false}
          showAllOption={true}
          allOptionLabel="All locations"
          displayAllQuantity={true}
        />
      </div>

      <div className="border-khp-border pt-4">
        {/* Move Summary Panel - Always visible */}
        <div className="mt-4 p-3 bg-khp-background-secondary rounded-lg border border-khp-border">
          <div className="flex justify-between items-center">
            <span className="text-sm text-khp-text-secondary">
              Current Stock{" "}
              {selectedSourceLocation
                ? `(${selectedSourceLocation.location.name})`
                : ""}
              :
            </span>
            <span className="font-medium text-khp-text-primary">
              {selectedSourceLocation ? selectedSourceLocation.quantity : 0}{" "}
              {ingredient.unit}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-khp-text-secondary">
              Move Quantity:
            </span>
            <span className="font-medium text-khp-primary">
              {moveQuantity.toFixed(3)} {ingredient.unit}
            </span>
          </div>
          <div className="flex justify-between items-center mt-1 pt-1 border-t border-khp-border">
            <span className="text-sm font-medium text-khp-text-primary">
              Remaining at Source:
            </span>
            <span
              className={`font-bold ${selectedSourceLocation && selectedSourceLocation.quantity - moveQuantity < 0 ? "text-khp-error" : "text-khp-primary"}`}
            >
              {selectedSourceLocation
                ? Math.max(
                    0,
                    selectedSourceLocation.quantity - moveQuantity
                  ).toFixed(3)
                : (0 - moveQuantity).toFixed(3)}{" "}
              {ingredient.unit}
            </span>
          </div>
          {formData.destinationLocationIndex && (
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm font-medium text-khp-text-primary">
                New Total at Destination:
              </span>
              <span className="font-bold text-khp-success">
                {(() => {
                  const selectedDestination =
                    destinationQuantities[
                      parseInt(formData.destinationLocationIndex)
                    ];
                  const currentDestinationQuantity =
                    selectedDestination?.quantity || 0;
                  return (currentDestinationQuantity + moveQuantity).toFixed(3);
                })()}{" "}
                {ingredient.unit}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error display or Button - errors replace the button */}
      <div>
        {(() => {
          const validationError = validateForm();
          const hasExcessiveMove =
            moveQuantity > 0 && moveQuantity > maxQuantity;

          if (validationError || hasExcessiveMove) {
            return (
              <div className="w-full p-4 bg-khp-error/10 border border-khp-error/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-khp-error mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-khp-error">
                      {validationError ||
                        `Cannot move - exceeds available stock`}
                    </p>
                    {hasExcessiveMove && selectedSourceLocation && (
                      <p className="text-xs text-khp-error/80 mt-1">
                        You cannot move more than{" "}
                        {selectedSourceLocation.quantity} {ingredient.unit}{" "}
                        available in {selectedSourceLocation.location.name}.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <Button
              variant="khp-default"
              size="xl"
              className="w-full py-4 px-6 text-base font-semibold"
              type="submit"
              disabled={
                isSubmitting ||
                !formData.sourceLocationIndex ||
                !formData.destinationLocationIndex ||
                moveQuantity <= 0
              }
            >
              {isSubmitting ? "Moving..." : "Move Quantity"}
            </Button>
          );
        })()}
      </div>
    </form>
  );
}
