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

export const getWaitingTime = (createdAt: string) => {
  const currentTime = new Date();
  const created = new Date(createdAt);
  const diffMs = currentTime.getTime() - created.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  if (diffMinutes > 0) {
    return `${diffMinutes}min ${diffSeconds}s`;
  }
  return `${diffSeconds}s`;
};

export const getUrgencyColor = (createdAt: string) => {
  const currentTime = new Date();
  const created = new Date(createdAt);
  const diffMinutes = Math.floor(
    (currentTime.getTime() - created.getTime()) / (1000 * 60),
  );
  if (diffMinutes > 20) return "text-red-600";
  if (diffMinutes > 10) return "text-orange-600";
  return "text-gray-600";
};
