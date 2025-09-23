import { Badge } from "@workspace/ui/components/badge";
import { OrderStatus } from "@workspace/ui/lib/order";
import { cn } from "@workspace/ui/lib/utils";

function OrderStatusBadge({
  status,
  className,
  size = "default",
}: {
  status: OrderStatus;
  className?: string;
  size?: "default" | "large";
}) {
  const getStatusStyles = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return {
          bg: "bg-khp-warning/10",
          text: "text-khp-warning",
          border: "border-khp-warning/20",
          label: "Pending",
        };
      case "SERVED":
        return {
          bg: "bg-khp-info/10",
          text: "text-khp-info",
          border: "border-khp-info/20",
          label: "Served",
        };
      case "PAYED":
        return {
          bg: "bg-khp-primary/10",
          text: "text-khp-primary",
          border: "border-khp-primary/20",
          label: "Payed",
        };
      case "CANCELED":
        return {
          bg: "bg-khp-error/10",
          text: "text-khp-error",
          border: "border-khp-error/20",
          label: "Canceled",
        };
      case "READY":
        return {
          bg: "bg-khp-info/10",
          text: "text-khp-info",
          border: "border-khp-info/20",
          label: "Available",
        };
      default:
        return {
          bg: "bg-khp-background-secondary",
          text: "text-khp-text-secondary",
          border: "border-khp-border",
          label: "Unknown",
        };
    }
  };

  const statusStyles = getStatusStyles(status);
  const sizeClasses = cn(
    size === "large" ? "text-base px-6 py-3 font-semibold" : "text-xs px-2 py-1"
  );

  return (
    <Badge
      className={cn(
        sizeClasses,
        statusStyles.bg,
        statusStyles.text,
        statusStyles.border,
        "border rounded-md",
        className
      )}
    >
      {statusStyles.label}
    </Badge>
  );
}

export default OrderStatusBadge;
