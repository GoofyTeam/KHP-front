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
  const { ingredientId, from_location_id, to_location_id, quantity } = input;

  return executeHttpAction(
    () =>
      httpClient.post(`/api/ingredients/${ingredientId}/move-quantity`, {
        from_location_id,
        to_location_id,
        quantity,
      }),
    "Failed to move ingredient quantity: "
  );
}

export interface UpdateIngredientInput {
  ingredientId: string | number;
  name?: string;
  unit?: string;
  category_id?: number | null;
  quantities?: { location_id: number; quantity: number }[];
  barcode?: string;
  base_quantity?: number;
  base_unit?: string;
  allergens?: string[];
  image_url?: string;
  image?: File;
}

export async function updateIngredientAction(
  input: UpdateIngredientInput
): Promise<ActionResult> {
  const { ingredientId, image, ...data } = input;

  // If there's an image file, use FormData
  if (image) {
    const formData = new FormData();

    // Add all other fields to FormData
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    formData.append("image", image);

    return executeHttpAction(
      () => httpClient.put(`/api/ingredients/${ingredientId}`, formData),
      "Failed to update ingredient: "
    );
  }

  // No image file, use regular JSON payload
  return executeHttpAction(
    () => httpClient.put(`/api/ingredients/${ingredientId}`, data),
    "Failed to update ingredient: "
  );
}

export async function deleteIngredientAction(
  ingredientId: string | number
): Promise<ActionResult> {
  return executeHttpAction(
    () => httpClient.delete(`/api/ingredients/${ingredientId}`),
    "Failed to delete ingredient: "
  );
}
