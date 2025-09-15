"use server";

import { httpClient } from "@/lib/httpClient";
import { type ActionResult, executeHttpAction } from "@/lib/actionUtils";

export interface MoveIngredientInput {
  ingredientId: string | number;
  from_location_id: number;
  to_location_id: number;
  quantity: number;
}

export async function moveIngredientQuantityAction(
  input: MoveIngredientInput
): Promise<ActionResult> {
  return executeHttpAction(() => {
    const { ingredientId, from_location_id, to_location_id, quantity } = input;

    const payload = {
      from_location_id,
      to_location_id,
      quantity,
    };

    return httpClient.post(
      `/api/ingredients/${ingredientId}/move-quantity`,
      payload
    );
  }, "Failed to move ingredient quantity: ");
}
