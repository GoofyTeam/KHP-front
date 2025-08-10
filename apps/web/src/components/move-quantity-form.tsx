"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { AlertCircle, CheckCircle } from "lucide-react";
import type { Ingredient, Location } from "../types/stocks";
import { QuantityInput } from "./quantity-input";
import { LocationSelector } from "./location-selector";

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
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedSourceLocation = formData.sourceLocationIndex
    ? ingredient.quantities[parseInt(formData.sourceLocationIndex)]
    : null;

  const maxQuantity = selectedSourceLocation?.quantity || 0;

  const getQuantityFromOTP = () => {
    if (formData.quantityOTP.length === 0) return 0;

    const padded = formData.quantityOTP.padEnd(6, "0");
    const beforeDecimal = padded.slice(0, 3) || "000";
    const afterDecimal = padded.slice(3, 6) || "000";

    return parseFloat(`${beforeDecimal}.${afterDecimal}`);
  };

  const moveQuantity = getQuantityFromOTP();

  const availableDestinations = allLocations.filter(
    (location) => location.id !== selectedSourceLocation?.location.id
  );

  // Convert available destinations to IngredientQuantity format for LocationSelector
  const destinationQuantities = availableDestinations.map((location) => ({
    quantity: 0, // Not relevant for destination selection
    location: location,
  }));

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.sourceLocationIndex) {
      return "Please select a source location";
    }
    if (!formData.destinationLocationIndex) {
      return "Please select a destination location";
    }
    if (moveQuantity <= 0) {
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
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccess(true);

      setTimeout(() => {
        router.push(`/ingredient/${ingredient.id}`);
      }, 2000);
    } catch (err) {
      console.error("Error moving quantity:", err);
      setError("An error occurred during the move. Please try again.");
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <LocationSelector
          quantities={ingredient.quantities}
          value={formData.sourceLocationIndex}
          onValueChange={(value) =>
            handleInputChange("sourceLocationIndex", value)
          }
          placeholder="Choose a source location"
          label="From"
        />
        {selectedSourceLocation && (
          <p className="text-xs text-khp-text-secondary">
            Available quantity: {selectedSourceLocation.quantity}{" "}
            {ingredient.unit}
          </p>
        )}
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
        <LocationSelector
          quantities={destinationQuantities}
          value={formData.destinationLocationIndex}
          onValueChange={(value) =>
            handleInputChange("destinationLocationIndex", value)
          }
          placeholder="Choose a destination location"
          label="To"
        />
      </div>

      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
      {moveQuantity > 0 && moveQuantity > maxQuantity && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-700">
            The quantity to move ({moveQuantity.toFixed(3)} {ingredient.unit})
            exceeds the available quantity ({maxQuantity} {ingredient.unit})
          </p>
        </div>
      )}

      <div className="flex space-x-4 pt-4">
        <Button
          variant="khp-default"
          type="submit"
          disabled={
            isSubmitting ||
            !formData.sourceLocationIndex ||
            !formData.destinationLocationIndex ||
            moveQuantity <= 0 ||
            moveQuantity > maxQuantity
          }
          className="flex-1"
        >
          {isSubmitting ? "Moving..." : "Move"}
        </Button>
      </div>
    </form>
  );
}
