"use server";

import { httpClient } from "@/lib/httpClient";
import { type ActionResult, executeHttpAction } from "@/lib/actionUtils";

export async function updateCompanyOptionsAction(input: {
  auto_complete_menu_orders?: boolean;
  open_food_facts_language?: "fr" | "en";
}): Promise<ActionResult> {
  return executeHttpAction(
    () => httpClient.put<unknown>("/api/company/options", input),
    "Validation error: "
  );
}
