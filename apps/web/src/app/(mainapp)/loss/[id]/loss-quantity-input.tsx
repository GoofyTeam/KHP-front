"use client";

import { useState } from "react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@workspace/ui/components/input-otp";

interface LossQuantityInputProps {
  totalStock: number;
  unit: string;
}

export function LossQuantityInput({
  totalStock,
  unit,
}: LossQuantityInputProps) {
  const [lossValue, setLossValue] = useState("");
  const getLossQuantity = () => {
    if (lossValue.length === 0) return 0;

    // Pad with zeros if needed
    const padded = lossValue.padEnd(6, "0");
    const beforeDecimal = padded.slice(0, 3) || "000";
    const afterDecimal = padded.slice(3, 6) || "000";

    return parseFloat(`${beforeDecimal}.${afterDecimal}`);
  };

  const lossQuantity = getLossQuantity();
  const remainingStock = Math.max(0, totalStock - lossQuantity);

  return (
    <>
      <div className="mt-6">
        <label className="block text-base font-semibold mb-4 text-khp-text-primary">
          Loss Quantity:
        </label>
        <div className="flex items-center justify-center sm:justify-start gap-3">
          <InputOTP
            maxLength={6}
            value={lossValue}
            onChange={setLossValue}
            className="!border-2 !border-khp-primary focus-within:!border-khp-primary-hover rounded-xl p-3 sm:p-5 transition-colors focus-within:!outline-none focus-within:!ring-0 focus-within:!ring-offset-0 w-fit"
          >
            <InputOTPGroup className="-gap-x-1 justify-center">
              <InputOTPSlot
                index={0}
                className="w-10 h-14 sm:w-16 sm:h-32 text-2xl sm:text-5xl font-bold font-mono !border-none bg-transparent focus:outline-none focus:ring-0 focus:!ring-offset-0 flex items-center justify-center"
                placeholder="0"
              />
              <InputOTPSlot
                index={1}
                className="w-10 h-14 sm:w-16 sm:h-32 text-2xl sm:text-5xl font-bold font-mono !border-none bg-transparent focus:outline-none focus:ring-0 focus:!ring-offset-0 flex items-center justify-center"
                placeholder="0"
              />
              <InputOTPSlot
                index={2}
                className="w-10 h-14 sm:w-16 sm:h-32 text-2xl sm:text-5xl font-bold font-mono !border-none bg-transparent focus:outline-none focus:ring-0 focus:!ring-offset-0 flex items-center justify-center"
                placeholder="0"
              />
              <div className="w-1.5 h-14 sm:h-32 flex items-center justify-center">
                <span className="text-2xl sm:text-5xl font-bold font-mono text-khp-text-primary">
                  .
                </span>
              </div>
              <InputOTPSlot
                index={3}
                className="w-10 h-14 sm:w-16 sm:h-32 text-2xl sm:text-5xl font-bold font-mono !border-none bg-transparent focus:outline-none focus:ring-0 focus:!ring-offset-0 flex items-center justify-center"
                placeholder="0"
              />
              <InputOTPSlot
                index={4}
                className="w-10 h-14 sm:w-16 sm:h-32 text-2xl sm:text-5xl font-bold font-mono !border-none bg-transparent focus:outline-none focus:ring-0 focus:!ring-offset-0 flex items-center justify-center"
                placeholder="0"
              />
              <InputOTPSlot
                index={5}
                className="w-10 h-14 sm:w-16 sm:h-32 text-2xl sm:text-5xl font-bold font-mono !border-none bg-transparent focus:outline-none focus:ring-0 focus:!ring-offset-0 flex items-center justify-center"
                placeholder="0"
              />
            </InputOTPGroup>
          </InputOTP>
          <span className="text-sm sm:text-base font-medium text-khp-text-primary">
            {unit}
          </span>
        </div>
      </div>

      <div className="mt-4 p-3 bg-khp-background-secondary rounded-lg border border-khp-border">
        <div className="flex justify-between items-center">
          <span className="text-sm text-khp-text-secondary">
            Current Stock:
          </span>
          <span className="font-medium text-khp-text-primary">
            {totalStock} {unit}
          </span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-khp-text-secondary">
            Loss Quantity:
          </span>
          <span className="font-medium text-khp-warning">
            -{lossQuantity.toFixed(3)} {unit}
          </span>
        </div>
        <div className="flex justify-between items-center mt-1 pt-1 border-t border-khp-border">
          <span className="text-sm font-medium text-khp-text-primary">
            After Loss:
          </span>
          <span
            className={`font-bold ${remainingStock < 0 ? "text-khp-error" : "text-khp-primary"}`}
          >
            {remainingStock.toFixed(3)} {unit}
          </span>
        </div>
      </div>

      {lossQuantity > totalStock && (
        <p className="text-xs text-khp-error mt-2">
          ⚠️ Loss quantity exceeds available stock!
        </p>
      )}

      <p className="text-xs text-khp-text-secondary mt-2">
        Enter the quantity lost (max: {totalStock} {unit})
      </p>
    </>
  );
}
