"use client";

import { useEffect, useRef, useState } from "react";

interface QuantityInputProps {
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  disabled?: boolean;
  title?: string;
  className?: string;
  autoFocus?: boolean;
  placeholder?: string;
}

export function QuantityInput({
  value = "",
  onChange,
  unit = "",
  disabled = false,
  title = "Quantity",
  className = "",
  autoFocus = false,
  placeholder = "",
}: QuantityInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [displayValue, setDisplayValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (autoFocus && inputRef.current && !disabled) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocus, disabled]);

  const formatDisplayValue = (val: string) => {
    if (!val || val === "0") return "";

    const numValue = parseFloat(val) || 0;
    if (numValue === 0) return "";

    return val.replace(/\.?0+$/, "");
  };

  useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatDisplayValue(value));
    }
  }, [value, isFocused]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value;

    inputValue = inputValue.replace(/[^0-9.,]/g, "");

    inputValue = inputValue.replace(/,/g, ".");

    const pointCount = (inputValue.match(/\./g) || []).length;
    if (pointCount > 1) {
      const firstPointIndex = inputValue.indexOf(".");
      inputValue =
        inputValue.substring(0, firstPointIndex + 1) +
        inputValue.substring(firstPointIndex + 1).replace(/\./g, "");
    }

    setDisplayValue(inputValue);

    onChange(inputValue);
  };

  const handleFocus = () => {
    setIsFocused(true);

    if (value && value !== "0") {
      setDisplayValue(value);
    } else {
      setDisplayValue("");
    }
  };

  const handleBlur = () => {
    setIsFocused(false);

    setDisplayValue(formatDisplayValue(value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      [
        "Backspace",
        "Delete",
        "Tab",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
        "Enter",
        "Escape",
      ].includes(e.key)
    ) {
      return;
    }

    if (!/[0-9.,]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");

    let cleanText = pastedText.replace(/[^0-9.,]/g, "");

    cleanText = cleanText.replace(/,/g, ".");

    const pointCount = (cleanText.match(/\./g) || []).length;
    if (pointCount > 1) {
      const firstPointIndex = cleanText.indexOf(".");
      cleanText =
        cleanText.substring(0, firstPointIndex + 1) +
        cleanText.substring(firstPointIndex + 1).replace(/\./g, "");
    }

    if (cleanText) {
      setDisplayValue(cleanText);
      onChange(cleanText);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <h3 className="text-sm sm:text-base font-semibold text-khp-text-primary mb-2">
        {title}
        {unit && ` (${unit.toLowerCase()})`}
      </h3>

      <div className="w-full">
        <div
          className={`relative border-2 rounded-xl py-4 px-6 bg-white ${
            disabled ? "border-gray-300" : "border-khp-primary"
          }`}
        >
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            disabled={disabled}
            placeholder="ex: 289.2"
            className="w-full text-center text-4xl md:text-5xl lg:text-6xl font-bold font-mono bg-transparent border-none outline-none focus:ring-0 placeholder:text-khp-text-secondary placeholder:opacity-30"
            style={{
              caretColor: "#22c55e",
            }}
          />
        </div>

        <div className="mt-2 text-xs text-khp-text-secondary text-center">
          {isFocused
            ? "Type your quantity directly (ex: 6.5)"
            : displayValue
              ? `${formatDisplayValue(value)} ${unit?.toLowerCase() || ""}`
              : "Click to enter a quantity"}
        </div>
      </div>
    </div>
  );
}
