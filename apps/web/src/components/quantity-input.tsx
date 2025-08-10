"use client";

import { useEffect, useRef } from "react";

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
  title = "Quantité",
  className = "",
  autoFocus = false,
  placeholder = "0",
}: QuantityInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0] && !disabled) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus, disabled]);

  const handleInputChange = (index: number, inputValue: string) => {
    if (!/^\d$/.test(inputValue) && inputValue !== "") return;

    const newValue = value.padEnd(6, "").split("");
    newValue[index] = inputValue;
    onChange(newValue.join("").replace(/\s+$/, ""));

    if (inputValue && index < 5) {
      let nextIndex;
      if (index < 2) {
        nextIndex = index + 1;
      } else if (index === 2) {
        nextIndex = 3;
      } else {
        nextIndex = index + 1;
      }

      const nextInput = inputRefs.current[nextIndex];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (!value[index] && index > 0) {
        let prevIndex;
        if (index === 3) {
          prevIndex = 2;
        } else {
          prevIndex = index - 1;
        }

        const prevInput = inputRefs.current[prevIndex];
        if (prevInput) {
          prevInput.focus();
        }
      } else if (value[index]) {
        const newValue = value.padEnd(6, "").split("");
        newValue[index] = "";
        onChange(newValue.join("").replace(/\s+$/, ""));
      }
    }

    if (
      !/[0-9]/.test(e.key) &&
      !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedText.length > 0) {
      const newValue = pastedText.padEnd(6, "").slice(0, 6);
      onChange(newValue.replace(/\s+$/, ""));

      const lastFilledIndex = Math.min(pastedText.length - 1, 5);
      const targetInput = inputRefs.current[lastFilledIndex];
      if (targetInput) {
        setTimeout(() => targetInput.focus(), 0);
      }
    }
  };

  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  return (
    <div className={`w-full ${className}`}>
      <h3 className="text-sm sm:text-base font-semibold text-khp-text-primary mb-2">
        {title}
      </h3>
      <div className="flex items-center justify-center gap-3 w-full">
        <div className="border-2 border-khp-primary rounded-xl py-3 sm:py-4 px-6 sm:px-8 transition-colors focus-within:border-khp-primary-hover bg-white w-full">
          <div className="flex items-center justify-center gap-1 sm:gap-1.5">
            {[0, 1, 2].map((index) => (
              <input
                key={index}
                ref={setInputRef(index)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={value[index] || ""}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={disabled}
                className="w-12 sm:w-16 md:w-20 lg:w-24 h-16 sm:h-20 md:h-24 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-mono border-none bg-transparent text-left pl-2 focus:outline-none focus:ring-0 placeholder:opacity-50"
                placeholder={placeholder}
              />
            ))}

            <div className="w-4 sm:w-5 h-16 sm:h-20 md:h-24 flex items-center justify-center">
              <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-mono text-khp-text-primary">
                .
              </span>
            </div>

            {[3, 4, 5].map((index) => (
              <input
                key={index}
                ref={setInputRef(index)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={value[index] || ""}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={disabled}
                className="w-12 sm:w-16 md:w-20 lg:w-24 h-16 sm:h-20 md:h-24 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-mono border-none bg-transparent text-left pl-2 focus:outline-none focus:ring-0 placeholder:opacity-50"
                placeholder={placeholder}
              />
            ))}
          </div>
        </div>

        {unit && (
          <span className="text-sm sm:text-base md:text-lg font-medium text-khp-text-primary flex-shrink-0">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
