import { Badge } from "@workspace/ui/components/badge";
import { OrderStatus } from "@workspace/ui/lib/order";

function OrderStatusBadge({
  status,
  className,
}: {
  status: OrderStatus;
  className?: string;
}) {
  let bgColor = "";
  let textColor = "";
  let label = "";

  switch (status) {
    case "PENDING":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      label = "Pending";
      break;
    case "SERVED":
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      label = "Served";
      break;
    case "PAYED":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      label = "Payed";
      break;
    case "CANCELED":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      label = "Canceled";
      break;
    case "READY":
      bgColor = "bg-purple-100";
      textColor = "text-purple-800";
      label = "Available";
      break;
    default:
      bgColor = "bg-gray-100";
      textColor = "text-gray-800";
      label = "Unknown";
  }

  return (
    <Badge
      className={`text-xs px-2 py-1 ${bgColor} ${textColor} border ${bgColor.replace("bg-", "border-")} ${className ?? ""} rounded-md`}
    >
      {label}
    </Badge>
  );
}

export default OrderStatusBadge;
