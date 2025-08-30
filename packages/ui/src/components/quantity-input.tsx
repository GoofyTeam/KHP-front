"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

// Helpers purs, définis hors composant pour éviter de les recréer
const ONLY_NUMERIC_CHARS = /[^0-9.,]/g;
const DOT_GLOBAL = /\./g;

function cleanNumericString(raw: string): string {
  // garder chiffres + , .
  let cleaned = raw.replace(ONLY_NUMERIC_CHARS, "");
  // normaliser , -> .
  cleaned = cleaned.replace(/,/g, ".");
  // ne garder qu'un seul point
  const pointCount = (cleaned.match(DOT_GLOBAL) || []).length;
  if (pointCount > 1) {
    const firstPointIndex = cleaned.indexOf(".");
    cleaned =
      cleaned.substring(0, firstPointIndex + 1) +
      cleaned.substring(firstPointIndex + 1).replace(DOT_GLOBAL, "");
  }
  return cleaned;
}

function formatDisplayValue(val: string): string {
  if (!val || val === "0") return "";
  const numValue = parseFloat(val) || 0;
  if (numValue === 0) return "";
  // supprimer les zéros inutiles en fin de décimal
  return val.replace(/\.?0+$/, "");
}

export function QuantityInput({
  value = "",
  onChange,
  unit = "",
  disabled = false,
  title = "Quantity",
  className = "",
  autoFocus = false,
  placeholder = "ex: 289.2",
}: QuantityInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Focus auto identique au comportement d'origine
  useEffect(() => {
    if (autoFocus && inputRef.current && !disabled) {
      const id = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(id);
    }
  }, [autoFocus, disabled]);

  // Affichage brut si focus, formaté sinon (mémoïsé pour éviter du travail inutile)
  const displayValue = useMemo(
    () => (isFocused ? value : formatDisplayValue(value)),
    [value, isFocused]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(cleanNumericString(e.target.value));
    },
    [onChange]
  );

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    },
    []
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const cleaned = cleanNumericString(e.clipboardData.getData("text"));
      onChange(cleaned);
    },
    [onChange]
  );

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
            placeholder={placeholder}
            className="w-full text-center text-4xl md:text-5xl lg:text-6xl font-bold font-mono bg-transparent border-none outline-none focus:ring-0 placeholder:text-khp-text-secondary placeholder:opacity-30"
            style={{ caretColor: "#22c55e" }}
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
