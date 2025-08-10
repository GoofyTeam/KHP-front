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
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [autoFocus, disabled]);

  const getFormattedValue = (val: string) => {
    return val.padEnd(6, " ");
  };

  const handleInputChange = (index: number, inputValue: string) => {
    if (!/^\d?$/.test(inputValue)) return;

    const currentFormatted = getFormattedValue(value);
    const newValueArray = currentFormatted.split("");
    newValueArray[index] = inputValue || " ";

    const newValue = newValueArray.join("").replace(/\s+$/, "");
    onChange(newValue);

    if (inputValue && index < 5) {
      const nextIndex = index + 1;
      const nextInput = inputRefs.current[nextIndex];
      if (nextInput) {
        setTimeout(() => nextInput.focus(), 10);
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      const currentFormatted = getFormattedValue(value);

      if (!currentFormatted[index] || currentFormatted[index] === " ") {
        if (index > 0) {
          const prevInput = inputRefs.current[index - 1];
          if (prevInput) {
            setTimeout(() => prevInput.focus(), 10);
          }
        }
      } else {
        const newValueArray = currentFormatted.split("");
        newValueArray[index] = " ";
        const newValue = newValueArray.join("").replace(/\s+$/, "");
        onChange(newValue);
      }
    }
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        setTimeout(() => prevInput.focus(), 10);
      }
    }

    if (e.key === "ArrowRight" && index < 5) {
      e.preventDefault();
      const nextInput = inputRefs.current[index + 1];
      if (nextInput) {
        setTimeout(() => nextInput.focus(), 10);
      }
    }
    if (
      !/[0-9]/.test(e.key) &&
      ![
        "Backspace",
        "Delete",
        "Tab",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
      ].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text").replace(/\D/g, "");
    if (pastedText.length > 0) {
      const limitedText = pastedText.slice(0, 6);
      onChange(limitedText);

      const lastIndex = Math.min(limitedText.length - 1, 5);
      const targetInput = inputRefs.current[lastIndex];
      if (targetInput) {
        setTimeout(() => targetInput.focus(), 10);
      }
    }
  };

  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  const formattedValue = getFormattedValue(value);

  return (
    <div className={`w-full ${className}`}>
      <h3 className="text-sm sm:text-base font-semibold text-khp-text-primary mb-2">
        {title}
      </h3>
      <div className="flex items-center justify-center gap-3 w-full">
        <div className="border-2 border-khp-primary rounded-xl py-1 px-2 sm:py-2 sm:px-4 transition-colors focus-within:border-khp-primary-hover bg-white w-full">
          <div className="flex items-center justify-center gap-0.5 sm:gap-1">
            {[0, 1, 2].map((index) => (
              <input
                key={index}
                ref={setInputRef(index)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={
                  formattedValue[index] === " " ? "" : formattedValue[index]
                }
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={disabled}
                className="w-10 sm:w-12 md:w-16 h-14 sm:h-16 md:h-20 text-3xl sm:text-2xl md:text-3xl lg:text-4xl font-bold font-mono border-none bg-transparent text-center focus:outline-none focus:ring-0 placeholder:opacity-50"
                placeholder={placeholder}
              />
            ))}

            <div className="w-4 sm:w-4 h-14 sm:h-16 md:h-20 flex items-center justify-center">
              <span className="text-3xl sm:text-2xl md:text-3xl lg:text-4xl font-bold font-mono text-khp-text-primary">
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
                value={
                  formattedValue[index] === " " ? "" : formattedValue[index]
                }
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                disabled={disabled}
                className="w-10 sm:w-12 md:w-16 h-14 sm:h-16 md:h-20 text-3xl sm:text-2xl md:text-3xl lg:text-4xl font-bold font-mono border-none bg-transparent text-center focus:outline-none focus:ring-0 placeholder:opacity-50"
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
