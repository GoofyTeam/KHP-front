"use server";

import { httpClient } from "@/lib/httpClient";

export type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

function handleHttpError<T = unknown>(e: unknown): ActionResult<T> {
  if (e instanceof Error) {
    return { success: false, error: e.message };
  }
  return { success: false, error: "An unexpected error occurred" };
}

export async function deleteMenu(id: string): Promise<ActionResult> {
  try {
    // Use API prefix like other resources
    await httpClient.delete(`/api/menus/${id}`);
    return { success: true };
  } catch (e) {
    console.error("Error deleting menu:", e);
    return handleHttpError(e);
  }
}
