"use client";

import * as React from "react";
import { Copy, Check } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";
import { useContainerWidth } from "@workspace/ui/hooks/use-container-width";

interface PrefixInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange"> {
  prefix: string;
  value?: string;
  onChange?: (value: string) => void;
  showCopyButton?: boolean;
  onCopyFullValue?: (fullValue: string) => void;
  hidePrefix?: boolean;
  minWidthToShowPrefix?: number;
  prefixClassName?: string;
  copyButtonClassName?: string;
}

function PrefixInput({
  className,
  prefix,
  value = "",
  onChange,
  showCopyButton = false,
  onCopyFullValue,
  hidePrefix = false,
  minWidthToShowPrefix = 300,
  prefixClassName = "",
  copyButtonClassName = "",
  ...props
}: PrefixInputProps) {
  const [copied, setCopied] = React.useState(false);
  const fullValue = prefix + value;

  const { width, containerRef } = useContainerWidth();
  const shouldHidePrefix = hidePrefix || width < minWidthToShowPrefix;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e.target.value);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullValue);
      onCopyFullValue?.(fullValue);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center min-w-0 flex-1"
    >
      <div className="relative flex w-full min-w-0">
        {!shouldHidePrefix && (
          <div
            className={cn(
              "flex items-center px-3 py-1 text-sm text-muted-foreground bg-muted border border-r-0 border-input rounded-l-md flex-shrink-0 whitespace-nowrap",
              prefixClassName
            )}
          >
            {prefix}
          </div>
        )}

        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={shouldHidePrefix ? fullValue : undefined}
          className={cn(
            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 min-w-0 flex-1 border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
            showCopyButton
              ? "rounded-r-none border-r-0"
              : shouldHidePrefix
                ? "rounded-md"
                : "rounded-l-none",
            shouldHidePrefix && !showCopyButton
              ? "rounded-md"
              : shouldHidePrefix
                ? "rounded-l-md"
                : "rounded-l-none",
            className
          )}
          {...props}
        />

        {showCopyButton && (
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn(
              "h-9 border-l-0 bg-transparent flex-shrink-0",
              shouldHidePrefix
                ? "rounded-l-none rounded-r-md"
                : "rounded-l-none",
              copyButtonClassName
            )}
            onClick={handleCopy}
            title="Copier l'URL complète"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

export { PrefixInput };
