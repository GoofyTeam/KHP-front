export type QuickAccessNormalizedColor =
  | "primary"
  | "error"
  | "warning"
  | "info";

export const normalizeQuickAccessColor = (
  color: unknown,
): QuickAccessNormalizedColor => {
  const colorKey = String(color).toLowerCase();
  switch (colorKey) {
    case "primary":
    case "error":
    case "warning":
    case "info":
      return colorKey as QuickAccessNormalizedColor;
    default:
      return "primary";
  }
};

export const quickAccessBgClassByColor: Record<
  QuickAccessNormalizedColor,
  string
> = {
  primary: "bg-khp-primary",
  error: "bg-khp-error",
  warning: "bg-khp-warning",
  info: "bg-khp-info",
};

export const getQuickAccessBgClass = (color: unknown): string =>
  quickAccessBgClassByColor[normalizeQuickAccessColor(color)];

// URL key to URL mapping
export const quickAccessUrlMap: Record<string, string> = {
  add_to_stock: "/stocks/add",
  take_order: "/dashboard",
  menu_card: "/menus",
  stock: "/stocks",
  move_quantity: "/dashboard",
};

export const getQuickAccessUrl = (urlKey: string): string => {
  return quickAccessUrlMap[urlKey] ?? "/";
};
