"use server";

import { httpClient } from "@/lib/httpClient";
import {
  type ActionResult as LibActionResult,
  executeHttpAction,
} from "@/lib/actionUtils";

export type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

function handleHttpError<T = unknown>(e: unknown): ActionResult<T> {
  if (e instanceof Error) {
    return { success: false, error: e.message };
  }
  return { success: false, error: "An unexpected error occurred" };
}

export async function deletePreparation(id: string): Promise<ActionResult> {
  try {
    // Use API prefix like other resources
    await httpClient.delete(`/api/preparations/${id}`);
    return { success: true };
  } catch (e) {
    console.error("Error deleting menu:", e);
    return handleHttpError(e);
  }
}

export interface AddPreparationQuantityInput {
  location_id: number;
  quantity: number;
  unit?: string;
}

export interface RemovePreparationQuantityInput {
  location_id: number;
  quantity: number;
  unit?: string;
}

export async function addPreparationQuantityAction(
  preparationId: string | number,
  input: AddPreparationQuantityInput
): Promise<LibActionResult> {
  return executeHttpAction(
    () =>
      httpClient.post(`/api/preparations/${preparationId}/add-quantity`, input),
    "Failed to add preparation quantity: "
  );
}

export async function removePreparationQuantityAction(
  preparationId: string | number,
  input: RemovePreparationQuantityInput
): Promise<LibActionResult> {
  return executeHttpAction(
    () =>
      httpClient.post(
        `/api/preparations/${preparationId}/remove-quantity`,
        input
      ),
    "Failed to remove preparation quantity: "
  );
}

export interface MovePreparationQuantityInput {
  from_location_id: number;
  to_location_id: number;
  quantity: number;
  unit?: string;
}

export async function movePreparationQuantityAction(
  preparationId: string | number,
  input: MovePreparationQuantityInput
): Promise<LibActionResult> {
  return executeHttpAction(
    () =>
      httpClient.post(
        `/api/preparations/${preparationId}/move-quantity`,
        input
      ),
    "Failed to move preparation quantity: "
  );
}
