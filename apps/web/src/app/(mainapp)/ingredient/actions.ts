"use server";

import { httpClient } from "@/lib/httpClient";

type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

function handleHttpError<T = unknown>(e: unknown): ActionResult<T> {
  if (!(e instanceof Error)) {
    return { success: false, error: "Unknown error" };
  }

  const match = e.message.match(/^(\d{3}):\s*(.*)$/);
  if (!match) {
    return { success: false, error: e.message };
  }

  const status = Number(match[1]);
  const detail = match[2] || "";

  switch (status) {
    case 401:
      return { success: false, error: "Unauthorized" };
    case 400:
      return { success: false, error: "Invalid request data" };
    case 422:
      return handleValidationError(detail);
    default:
      return { success: false, error: detail || e.message };
  }
}

function handleValidationError<T = unknown>(detail: string): ActionResult<T> {
  try {
    const json = JSON.parse(detail);
    if (json?.errors) {
      const [field, messages] = Object.entries(json.errors)[0] as [
        string,
        unknown,
      ];
      const message = Array.isArray(messages)
        ? String(messages[0])
        : String(messages);
      return {
        success: false,
        error: `Validation error on ${field}: ${message}`,
      };
    }
  } catch {}
  return { success: false, error: "Validation failed" };
}

export interface MoveIngredientInput {
  ingredientId: number;
  from_location_id: number;
  to_location_id: number;
  quantity: number;
}

export async function moveIngredientQuantityAction(
  input: MoveIngredientInput
): Promise<ActionResult> {
  try {
    const { ingredientId, from_location_id, to_location_id, quantity } = input;

    await httpClient.post(`/api/ingredients/${ingredientId}/move-quantity`, {
      from_location_id,
      to_location_id,
      quantity,
    });

    return { success: true };
  } catch (e) {
    return handleHttpError(e);
  }
}
