"use server";

import { httpClient } from "@/lib/httpClient";
import { type ActionResult, executeHttpAction } from "@/lib/actionUtils";

export interface MoveIngredientInput {
  ingredientId: string | number;
  from_location_id: number;
  to_location_id: number;
  quantity: number;
}

function handleHttpError<T = unknown>(e: unknown): ActionResult<T> {
  if (e instanceof Error) {
    return { success: false, error: e.message };
  }
  return { success: false, error: "An unexpected error occurred" };
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

  // Always use FormData like in menu actions
  const formData = new FormData();

  // Add _method for PUT request (Laravel convention)
  formData.append("_method", "PUT");

  // Add all fields to FormData
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        // Handle arrays like in menu actions
        for (const item of value) {
          formData.append(`${key}[]`, String(item));
        }
      } else {
        formData.append(key, String(value));
      }
    }
  });

  // Add image if present
  if (image) {
    formData.append("image", image);
  }

  return executeHttpAction(
    () => httpClient.post(`/api/ingredients/${ingredientId}`, formData),
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

export async function deleteIngredient(id: string): Promise<ActionResult> {
  try {
    await httpClient.delete(`/api/ingredients/${id}`);
    return { success: true };
  } catch (e) {
    console.error("Error deleting menu:", e);
    return handleHttpError(e);
  }
}

export interface AddQuantityInput {
  location_id: number;
  quantity: number;
  unit?: string;
}

export interface RemoveQuantityInput {
  location_id: number;
  quantity: number;
  unit?: string;
}

export async function addIngredientQuantityAction(
  ingredientId: string | number,
  input: AddQuantityInput
): Promise<ActionResult> {
  return executeHttpAction(
    () =>
      httpClient.post(`/api/ingredients/${ingredientId}/add-quantity`, input),
    "Failed to add ingredient quantity: "
  );
}

export async function removeIngredientQuantityAction(
  ingredientId: string | number,
  input: RemoveQuantityInput
): Promise<ActionResult> {
  return executeHttpAction(
    () =>
      httpClient.post(
        `/api/ingredients/${ingredientId}/remove-quantity`,
        input
      ),
    "Failed to remove ingredient quantity: "
  );
}
