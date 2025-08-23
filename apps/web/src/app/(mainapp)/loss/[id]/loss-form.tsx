"use client";

import { useState } from "react";
import { Trash2, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { QuantityInput } from "@/components/quantity-input";
import { LocationSelector } from "@/components/LocationSelect";
import { Ingredient } from "@/lib/types/ingredient";
import { createLoss } from "@/lib/api/losses";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface LossFormProps {
  ingredient: Ingredient;
  totalStock: number;
}

export function LossForm({ ingredient, totalStock }: LossFormProps) {
  const [lossValue, setLossValue] = useState("");
  const [selectedLocationIndex, setSelectedLocationIndex] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const getLossQuantity = () => {
    if (lossValue.length === 0) return 0;
    return parseFloat(lossValue) || 0;
  };

  const lossQuantity = getLossQuantity();
  const availableLocations = ingredient.quantities.filter(
    (q) => q.quantity > 0
  );
  const selectedLocation = selectedLocationIndex
    ? availableLocations[parseInt(selectedLocationIndex)]
    : null;
  const isFormComplete =
    selectedLocation && lossQuantity > 0 && reason.trim().length > 0;

  const hasExcessiveLoss =
    selectedLocation && lossQuantity > selectedLocation.quantity;

  const isValid = isFormComplete && !hasExcessiveLoss;

  const handleSubmit = async () => {
    if (!isValid || !selectedLocation) return;

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const result = await createLoss({
        lossable_id: parseInt(ingredient.id),
        lossable_type: "ingredient",
        location_id: parseInt(selectedLocation.location.id),
        quantity: lossQuantity,
        reason: reason.trim(),
      });

      if (result.success) {
        setSubmitStatus({
          type: "success",
          message: "Perte enregistrée avec succès",
        });
        // Reset form
        setLossValue("");
        setSelectedLocationIndex("");
        setReason("");
      } else {
        setSubmitStatus({
          type: "error",
          message: result.message || "Erreur lors de l'enregistrement",
        });
      }
    } catch (error) {
      setSubmitStatus({ type: "error", message: "Erreur de connexion" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Location Selector */}
      <LocationSelector
        quantities={availableLocations}
        value={selectedLocationIndex}
        onValueChange={setSelectedLocationIndex}
        placeholder="Choose location"
        label="Location"
        unit={ingredient.unit}
      />

      {/* Reason Input */}
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-khp-text-primary">
          Reason
        </h3>
        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger className="w-full !h-14 text-base border-khp-primary focus:bg-khp-primary/5 transition-all">
            <SelectValue placeholder="Choose a reason for the loss" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            <SelectItem
              value="Expired"
              className="!h-14 !min-h-14 !py-4 !px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors touch-manipulation"
            >
              <span className="font-medium text-khp-text-primary">Expired</span>
            </SelectItem>
            <SelectItem
              value="Broken"
              className="!h-14 !min-h-14 !py-4 !px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors touch-manipulation"
            >
              <span className="font-medium text-khp-text-primary">Broken</span>
            </SelectItem>
            <SelectItem
              value="Spilled"
              className="!h-14 !min-h-14 !py-4 !px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors touch-manipulation"
            >
              <span className="font-medium text-khp-text-primary">Spilled</span>
            </SelectItem>
            <SelectItem
              value="Contaminated"
              className="!h-14 !min-h-14 !py-4 !px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors touch-manipulation"
            >
              <span className="font-medium text-khp-text-primary">
                Contaminated
              </span>
            </SelectItem>
            <SelectItem
              value="Damaged"
              className="!h-14 !min-h-14 !py-4 !px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors touch-manipulation"
            >
              <span className="font-medium text-khp-text-primary">Damaged</span>
            </SelectItem>
            <SelectItem
              value="Lost"
              className="!h-14 !min-h-14 !py-4 !px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors touch-manipulation"
            >
              <span className="font-medium text-khp-text-primary">Lost</span>
            </SelectItem>
            <SelectItem
              value="Other"
              className="!h-14 !min-h-14 !py-4 !px-4 text-base font-medium cursor-pointer hover:bg-khp-primary/10 focus:bg-khp-primary/15 transition-colors touch-manipulation"
            >
              <span className="font-medium text-khp-text-primary">Other</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Loss Quantity Input */}
      <div className=" border-khp-border pt-4">
        <QuantityInput
          value={lossValue}
          onChange={setLossValue}
          unit={ingredient.unit}
          title="Loss Quantity"
          autoFocus={true}
        />

        {/* Stock Summary */}
        {selectedLocation && (
          <div className="mt-4 p-3 bg-khp-background-secondary rounded-lg border border-khp-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-khp-text-secondary">
                Current Stock ({selectedLocation.location.name}):
              </span>
              <span className="font-medium text-khp-text-primary">
                {selectedLocation.quantity} {ingredient.unit}
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
                className={`font-bold ${selectedLocation.quantity - lossQuantity < 0 ? "text-khp-error" : "text-khp-primary"}`}
              >
                {Math.max(0, selectedLocation.quantity - lossQuantity).toFixed(
                  3
                )}{" "}
                {ingredient.unit}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Status Messages */}
      {submitStatus && (
        <div
          className={`p-4 rounded-lg border ${
            submitStatus.type === "success"
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {submitStatus.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{submitStatus.message}</span>
          </div>
        </div>
      )}

      {/* Excessive Loss Warning */}
      {hasExcessiveLoss && selectedLocation && (
        <div className="w-full p-4 bg-khp-error/10 border border-khp-error/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-khp-error mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-khp-error">
                Cannot add loss - exceeds available stock
              </p>
              <p className="text-xs text-khp-error/80 mt-1">
                You cannot lose more than {selectedLocation.quantity}{" "}
                {ingredient.unit} available in {selectedLocation.location.name}.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add Loss Button */}
      <div className="mt-8 pt-6 border-t border-khp-border">
        <Button
          variant="destructive"
          size="xl"
          className="w-full py-4 px-6 text-base font-semibold"
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
        >
          <Trash2 className="w-5 h-5 mr-3" />
          {isSubmitting ? "Recording Loss..." : "Add Loss"}
        </Button>
        {isFormComplete && !hasExcessiveLoss && (
          <p className="text-xs text-khp-text-secondary mt-2 text-center">
            This will record a loss of {lossQuantity.toFixed(3)}{" "}
            {ingredient.unit} from {selectedLocation?.location.name}
          </p>
        )}
      </div>
    </>
  );
}
