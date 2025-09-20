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
  price: number | string;
  image_url?: string | null;
  has_sufficient_stock: boolean;
  categories: RestaurantCardCategory[];
  allergens: string[];
}

export interface RestaurantCardCompany {
  name: string;
  slug?: string | null;
  public_menu_card_url: string;
  menus: RestaurantCardMenu[];
  show_menu_images?: boolean;
  show_out_of_stock_menus_on_card?: boolean;
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

    return {
      status: "success",
      company: response.company,
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
