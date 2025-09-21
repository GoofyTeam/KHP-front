import { Clock, Users, CreditCard, ArrowLeft, CheckCircle } from "lucide-react";

export type OrderStatus = "PENDING" | "SERVED" | "PAYED" | "CANCELED" | "READY";
export type MenuType = "PREP" | "DIRECT";
export type OrderStepStatus = "IN_PREP" | "READY" | "SERVED";

export function getCorrectIcon(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return Clock;
    case "SERVED":
      return Users;
    case "PAYED":
      return CreditCard;
    case "CANCELED":
      return ArrowLeft;
    case "READY":
      return CheckCircle;
    default:
      return Clock;
  }
}

export function getMenuTypeLabel(type: MenuType) {
  switch (type) {
    case "PREP":
      return "Needs preparation";
    case "DIRECT":
      return "Ready to serve immediately";
    default:
      return "Unknown";
  }
}

export function getPreparationLabel(status: OrderStepStatus) {
  switch (status) {
    case "IN_PREP":
      return "In preparation";
    case "READY":
      return "Ready";
    case "SERVED":
      return "Served";
    default:
      return "Unknown";
  }
}
