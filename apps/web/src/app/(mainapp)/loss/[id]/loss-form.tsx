"use client";

import { useState } from "react";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { LossQuantityInput } from "./loss-quantity-input";
import { Ingredient } from "@/lib/types/ingredient";

interface LossFormProps {
  ingredient: Ingredient;
  totalStock: number;
}

export function LossForm({ ingredient, totalStock }: LossFormProps) {
  const [isValid, setIsValid] = useState(false);
  const [lossQuantity, setLossQuantity] = useState(0);

  const handleValidationChange = (valid: boolean, quantity: number) => {
    setIsValid(valid);
    setLossQuantity(quantity);
  };

  const hasExcessiveLoss = lossQuantity > totalStock;
  const hasNoLoss = lossQuantity === 0;

  return (
    <>
      {/* Loss Quantity Input */}
      <div className="border-t border-khp-border">
        <LossQuantityInput
          totalStock={totalStock}
          unit={ingredient.unit}
          onValidationChange={handleValidationChange}
        />
      </div>

      {/* Add Loss Button or Error Message */}
      <div className="mt-8 pt-6 border-t border-khp-border">
        {isValid ? (
          <>
            <Button
              variant="destructive"
              size="xl"
              className="w-full py-4 px-6 text-base font-semibold"
            >
              <Trash2 className="w-5 h-5 mr-3" />
              Add Loss
            </Button>
            <p className="text-xs text-khp-text-secondary mt-2 text-center">
              This will record a loss of {lossQuantity.toFixed(3)}{" "}
              {ingredient.unit}
            </p>
          </>
        ) : (
          <div className="w-full p-4 bg-khp-error/10 border border-khp-error/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-khp-error mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                {hasExcessiveLoss && (
                  <div>
                    <p className="text-sm font-medium text-khp-error">
                      Cannot add loss - exceeds available stock
                    </p>
                    <p className="text-xs text-khp-error/80 mt-1">
                      You cannot lose more than {totalStock} {ingredient.unit}{" "}
                      available in stock.
                    </p>
                  </div>
                )}
                {hasNoLoss && !hasExcessiveLoss && (
                  <div>
                    <p className="text-sm font-medium text-khp-error">
                      Please enter a loss quantity
                    </p>
                    <p className="text-xs text-khp-error/80 mt-1">
                      Enter the amount you want to record as lost.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
