import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowDown, OctagonAlert } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

const stockStatusVariants = cva(
  "inline-flex items-center gap-1.5 transition-colors",
  {
    variants: {
      variant: {
        "in-stock": "",
        "out-of-stock": "",
        "low-stock": "",
        expired: "",
      },
    },
    defaultVariants: {
      variant: "in-stock",
    },
  }
);

const circleVariants = cva("rounded-full border flex-shrink-0", {
  variants: {
    variant: {
      "in-stock": "bg-green-500 border-green-500 w-3 h-3",
      "out-of-stock": "bg-red-500 border-red-500 w-3 h-3",
      "low-stock": "bg-orange-500 border-orange-500 w-3 h-3",
      expired: "bg-gray-500 border-gray-500 w-3 h-3",
    },
  },
  defaultVariants: {
    variant: "in-stock",
  },
});

interface StockStatusProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof stockStatusVariants> {
  showLabel?: boolean;
  label?: string;
}

const getIcon = (variant: string) => {
  switch (variant) {
    case "in-stock":
    case "low-stock":
      return ArrowDown;
    case "out-of-stock":
    case "expired":
      return OctagonAlert;
    default:
      return ArrowDown;
  }
};

const getDefaultLabel = (variant: string) => {
  switch (variant) {
    case "in-stock":
      return "In Stock";
    case "out-of-stock":
      return "Out of Stock";
    case "low-stock":
      return "Low Stock";
    case "expired":
      return "Expired";
    default:
      return "In Stock";
  }
};

function StockStatus({
  className,
  variant = "in-stock",
  showLabel = true,
  label,
  ...props
}: StockStatusProps) {
  const Icon = getIcon(variant || "in-stock");
  const displayLabel = label || getDefaultLabel(variant || "in-stock");

  return (
    <div className={cn(stockStatusVariants({ variant, className }))} {...props}>
      <div className={cn(circleVariants({ variant }))} />

      {showLabel && <span className="text-sm font-medium">{displayLabel}</span>}
    </div>
  );
}

export { StockStatus, stockStatusVariants, circleVariants };
