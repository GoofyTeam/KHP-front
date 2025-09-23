"use server";

import { httpClient } from "@/lib/httpClient";
import { type ActionResult, executeHttpAction } from "@/lib/actionUtils";

export async function deleteMenu(id: string): Promise<ActionResult> {
  return executeHttpAction(
    () => httpClient.delete(`/api/menus/${id}`),
    "Failed to delete menu: ",
  );
}
