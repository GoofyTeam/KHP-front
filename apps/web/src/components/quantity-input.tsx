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
    if (!/^\d*$/.test(inputValue)) return;

    const newValue = value.split("");
    newValue[index] = inputValue;
    onChange(newValue.join(""));

    if (inputValue && index < 5) {
      const nextIndex = index < 2 ? index + 1 : index + 2;
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
    if (e.key === "Backspace" && !value[index] && index > 0) {
      const prevIndex = index > 3 ? index - 2 : index - 1;
      const prevInput = inputRefs.current[prevIndex];
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const setInputRef = (index: number) => (el: HTMLInputElement | null) => {
    inputRefs.current[index] = el;
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="text-base font-semibold text-khp-text-primary">{title}</h3>
      <div className="flex items-center justify-center sm:justify-start gap-3">
        <div className="border-2 border-khp-primary rounded-xl p-3 transition-colors focus-within:border-khp-primary-hover bg-white">
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((index) => (
              <input
                key={index}
                ref={setInputRef(index)}
                type="text"
                maxLength={1}
                value={value[index] || ""}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={disabled}
                className="w-12 h-20 text-4xl font-bold font-mono border-none bg-transparent text-left pl-2 focus:outline-none focus:ring-0 placeholder:text-4xl placeholder:text-gray-400"
                placeholder={placeholder}
              />
            ))}

            <div className="w-3 h-20 flex items-center justify-center">
              <span className="text-3xl font-bold font-mono text-khp-text-primary">
                .
              </span>
            </div>

            {[3, 4, 5].map((index) => (
              <input
                key={index}
                ref={setInputRef(index)}
                type="text"
                maxLength={1}
                value={value[index] || ""}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={disabled}
                className="w-12 h-20 text-4xl font-bold font-mono border-none bg-transparent text-left pl-2 focus:outline-none focus:ring-0 placeholder:text-4xl placeholder:text-gray-400"
                placeholder={placeholder}
              />
            ))}
          </div>
        </div>

        {unit && (
          <span className="text-lg font-medium text-khp-text-primary">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
