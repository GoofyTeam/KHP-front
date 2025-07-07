import type * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowDown, OctagonAlert } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 transition-colors",
  {
    variants: {
      variant: {
        "in-stock": "text-khp-primary",
        "out-of-stock": "text-khp-error",
        "low-stock": "text-khp-warning",
        expired: "text-khp-error",
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
      "in-stock": "bg-khp-primary border-khp-primary w-4 h-4",
      "out-of-stock": "bg-khp-error border-khp-error w-4 h-4",
      "low-stock": "",
      expired: "",
    },
  },
  defaultVariants: {
    variant: "in-stock",
  },
});

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
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

function Badge({
  className,
  variant = "in-stock",
  showLabel = true,
  label,
  ...props
}: BadgeProps) {
  const Icon = getIcon(variant || "in-stock");
  const displayLabel = label || getDefaultLabel(variant || "in-stock");

  return (
    <div className={cn(badgeVariants({ variant, className }))} {...props}>
      {/* For in-stock and out-of-stock, show colored circle */}
      {(variant === "in-stock" || variant === "out-of-stock") && (
        <div className={cn(circleVariants({ variant }))} />
      )}

      {/* For low-stock and expired, show icon */}
      {(variant === "low-stock" || variant === "expired") && (
        <Icon className="size-5" />
      )}

      {/* Show label if requested */}
      {showLabel && <span className="text-sm font-medium">{displayLabel}</span>}
    </div>
  );
}

export { Badge, badgeVariants, circleVariants };
