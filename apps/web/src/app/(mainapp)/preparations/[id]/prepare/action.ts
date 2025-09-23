"use server";

import { httpClient } from "@/lib/httpClient";
import { type ActionResult, executeHttpAction } from "@/lib/actionUtils";

export type PreparePreparationInput = {
  id: string;
  quantity: number;
  location_id: number;
  overrides?: Array<{
    id: number;
    type: "ingredient" | "preparation";
    quantity?: number;
    unit?: string;
    location_id?: number;
  }>;
};

export async function preparePreparationAction(
  input: PreparePreparationInput,
): Promise<ActionResult> {
  const { id, ...payload } = input;

  return executeHttpAction(
    () => httpClient.post(`/api/preparations/${id}/prepare`, payload),
    "Failed to prepare: ",
  );
}
