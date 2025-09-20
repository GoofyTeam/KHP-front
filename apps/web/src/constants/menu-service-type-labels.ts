import { MenuServiceTypeEnum } from "@/graphql/generated/graphql";

export const MENU_SERVICE_TYPE_LABELS: Record<MenuServiceTypeEnum, string> = {
  [MenuServiceTypeEnum.Direct]: "Direct service",
  [MenuServiceTypeEnum.Prep]: "Kitchen preparation",
};

export function getMenuServiceTypeLabel(
  serviceType?: MenuServiceTypeEnum | null
): string {
  if (!serviceType) return "—";
  return MENU_SERVICE_TYPE_LABELS[serviceType] ?? serviceType;
}
