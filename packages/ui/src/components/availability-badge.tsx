import { Badge, BadgeProps } from "@workspace/ui/components/badge";
import { ShieldCheck, TriangleAlert } from "lucide-react";

export function AvailabilityBadge({
  available,
  variant,
}: {
  available: boolean;
  variant?: BadgeProps["variant"];
}) {
  if (available) {
    return (
      <Badge
        variant={variant || "success"}
        className="text-lg px-2 py-4 gap-x-2 rounded-sm"
      >
        <ShieldCheck /> Enough stock to prepare this menu
      </Badge>
    );
  }

  return (
    <Badge
      variant={variant || "destructive"}
      className="text-lg px-2 py-4 gap-x-2 rounded-sm"
    >
      <TriangleAlert /> Not enough stock to prepare this menu
    </Badge>
  );
}

export function PreparationAvailabilityBadge({
  available,
  quantityPossible,
}: {
  available: boolean;
  quantityPossible?: string;
}) {
  if (available) {
    return (
      <Badge variant="success" className="text-lg px-2 py-4 gap-x-2 rounded-sm">
        <ShieldCheck /> Enough stock to make this preparation{" "}
        {quantityPossible && `(${quantityPossible} possible)`}
      </Badge>
    );
  }

  return (
    <Badge
      variant="destructive"
      className="text-lg px-2 py-4 gap-x-2 rounded-sm"
    >
      <TriangleAlert /> Not enough stock to make this preparation
    </Badge>
  );
}
