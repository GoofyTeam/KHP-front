import type * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

type StockVariant = "in-stock" | "out-of-stock" | "low-stock" | "expired";

interface StockStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: StockVariant;
  showLabel?: boolean;
  label?: string;
}

const statusConfig = {
  "in-stock": { color: "bg-khp-primary", label: "In Stock" },
  "out-of-stock": { color: "bg-destructive", label: "Out of Stock" },
  "low-stock": { color: "bg-orange-500", label: "Low Stock" },
  expired: { color: "bg-muted-foreground", label: "Expired" },
} as const;

export function StockStatus({
  className,
  variant = "in-stock",
  showLabel = true,
  label,
  ...props
}: StockStatusProps) {
  const config = statusConfig[variant];
  const displayLabel = label || config.label;

  return (
    <div
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    >
      <div className={cn("w-3 h-3 rounded-full", config.color)} />
      {showLabel && <span className="text-sm font-medium">{displayLabel}</span>}
    </div>
  );
}
