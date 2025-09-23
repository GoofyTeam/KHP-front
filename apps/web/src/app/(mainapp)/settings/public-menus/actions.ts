"use server";

import { httpClient } from "@/lib/httpClient";
import { type ActionResult, executeHttpAction } from "@/lib/actionUtils";

export type UpdatePublicMenusSettingsInput = {
  public_menu_card_url?: string;
  auto_complete_menu_orders?: boolean;
  open_food_facts_language?: "fr" | "en";
  show_out_of_stock_menus_on_card?: boolean;
  show_menu_images?: boolean;
};

export type UpdatePublicMenusSettingsResponse = {
  message: string;
  data: {
    auto_complete_menu_orders?: boolean;
    open_food_facts_language?: "fr" | "en";
    public_menu_card_url: string;
    show_out_of_stock_menus_on_card: boolean;
    show_menu_images: boolean;
  };
};

export async function updatePublicMenusSettingsAction(
  input: UpdatePublicMenusSettingsInput,
): Promise<ActionResult<UpdatePublicMenusSettingsResponse>> {
  return executeHttpAction(
    () =>
      httpClient.put<UpdatePublicMenusSettingsResponse>(
        "/api/public-menus",
        input,
      ),
    "Validation error: ",
  );
}
