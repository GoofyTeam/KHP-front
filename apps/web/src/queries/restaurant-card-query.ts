import { httpClient } from "@/lib/httpClient";

export interface RestaurantCardCategory {
  id: number;
  name: string;
}

export interface RestaurantCardMenu {
  id: number;
  name: string;
  description?: string | null;
  type?: string | null;
  menu_type_id?: number | null;
  menu_type_index?: number | null;
  priority?: number | null;
  price: number | string;
  image_url?: string | null;
  has_sufficient_stock: boolean;
  categories: RestaurantCardCategory[];
  allergens: string[];
}

export interface RestaurantCardContactInformation {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
}

export interface RestaurantCardAddress {
  line?: string | null;
  postal_code?: string | null;
  city?: string | null;
  country?: string | null;
}

export interface RestaurantCardBusinessHour {
  day_of_week: number;
  opens_at: string;
  closes_at: string;
  is_overnight: boolean;
  sequence: number;
}

export interface RestaurantCardSettings {
  show_out_of_stock_menus_on_card?: boolean;
  show_menu_images?: boolean;
}

export interface RestaurantCardCompany {
  name: string;
  slug?: string | null;
  public_menu_card_url: string;
  menus: RestaurantCardMenu[];
  show_menu_images?: boolean;
  show_out_of_stock_menus_on_card?: boolean;
  logo_path?: string | null;
  logo_url?: string | null;
  contact?: RestaurantCardContactInformation | null;
  address?: RestaurantCardAddress | null;
  business_hours?: RestaurantCardBusinessHour[] | null;
  settings?: RestaurantCardSettings | null;
}

interface RestaurantCardResponse {
  company?: RestaurantCardCompany;
}

export type RestaurantCardFetchResult =
  | { status: "success"; company: RestaurantCardCompany }
  | { status: "not-found"; message: string }
  | { status: "invalid-slug"; message: string }
  | { status: "error"; message: string };

export async function fetchRestaurantCard(
  publicMenuCardUrl: string
): Promise<RestaurantCardFetchResult> {
  if (!publicMenuCardUrl) {
    return {
      status: "invalid-slug",
      message: "The public URL format is invalid.",
    };
  }

  try {
    const response = await httpClient.get<RestaurantCardResponse>(
      `/api/restaurant-card/${encodeURIComponent(publicMenuCardUrl)}`
    );

    if (!response?.company) {
      return {
        status: "not-found",
        message: "We couldn't find a restaurant for this menu card.",
      };
    }

    const normalizedShowMenuImages =
      response.company.settings?.show_menu_images ??
      response.company.show_menu_images ??
      true;
    const normalizedShowOutOfStock =
      response.company.settings?.show_out_of_stock_menus_on_card ??
      response.company.show_out_of_stock_menus_on_card ??
      false;

    return {
      status: "success",
      company: {
        ...response.company,
        show_menu_images: normalizedShowMenuImages,
        show_out_of_stock_menus_on_card: normalizedShowOutOfStock,
        settings: {
          ...response.company.settings,
          show_menu_images: normalizedShowMenuImages,
          show_out_of_stock_menus_on_card: normalizedShowOutOfStock,
        },
        menus: sortMenusForDisplay(response.company.menus ?? []),
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred.";
    const normalized = message.toLowerCase();

    if (normalized.includes("404")) {
      return {
        status: "not-found",
        message: "We couldn't find a restaurant for this menu card.",
      };
    }

    if (
      normalized.includes("422") ||
      normalized.includes("invalid") ||
      normalized.includes("invalide") ||
      normalized.includes("slug") ||
      normalized.includes("public menu")
    ) {
      return {
        status: "invalid-slug",
        message: message || "The public URL format is invalid.",
      };
    }

    return {
      status: "error",
      message,
    };
  }
}

const ORDER_FALLBACK = Number.MAX_SAFE_INTEGER;

function getTypeOrder(menu: RestaurantCardMenu): number {
  return typeof menu.menu_type_index === "number"
    ? menu.menu_type_index
    : ORDER_FALLBACK;
}

function getPriorityOrder(menu: RestaurantCardMenu): number {
  return typeof menu.priority === "number" ? menu.priority : ORDER_FALLBACK;
}

function sortMenusForDisplay(menus: RestaurantCardMenu[]): RestaurantCardMenu[] {
  return menus.slice().sort((a, b) => {
    const typeComparison = getTypeOrder(a) - getTypeOrder(b);

    if (typeComparison !== 0) {
      return typeComparison;
    }

    const priorityComparison = getPriorityOrder(a) - getPriorityOrder(b);

    if (priorityComparison !== 0) {
      return priorityComparison;
    }

    return a.name.localeCompare(b.name, "fr", { sensitivity: "base" });
  });
}
