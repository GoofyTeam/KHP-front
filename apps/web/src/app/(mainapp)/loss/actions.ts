"use server";

import { httpClient } from "@/lib/httpClient";
import type { RequestData } from "@/lib/httpClient";
import { type ActionResult, executeHttpAction } from "@/lib/actionUtils";

function buildQueryString(
  params: Record<string, string | number | undefined>
): string {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, value.toString());
    }
  });

  return searchParams.toString();
}

export interface CreateLossInput extends RequestData {
  loss_item_id: number;
  loss_item_type: "ingredient" | "preparation";
  location_id: number;
  quantity: number;
  reason: string;
}

export interface GetLossesInput extends RequestData {
  loss_item_id?: number;
  loss_item_type?: "ingredient" | "preparation";
  location_id?: number;
  page?: number;
  limit?: number;
}

export interface Loss {
  id: number;
  loss_item_id: number;
  loss_item_type: "ingredient" | "preparation";
  location_id: number;
  quantity: number;
  reason: string;
  created_at: string;
  updated_at: string;
  location?: {
    id: number;
    name: string;
  };
}

export interface PaginatedLosses {
  data: Loss[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

export async function createLossAction(
  input: CreateLossInput
): Promise<ActionResult> {
  return executeHttpAction(
    () => httpClient.post<unknown, CreateLossInput>("/api/losses", input),
    "Loss creation error: "
  );
}

export async function getLossesAction(
  input: GetLossesInput = {}
): Promise<ActionResult<PaginatedLosses>> {
  return executeHttpAction(() => {
    const queryString = buildQueryString({
      loss_item_id: input.loss_item_id,
      loss_item_type: input.loss_item_type,
      location_id: input.location_id,
      page: input.page,
      limit: input.limit,
    });

    const url = queryString ? `/api/losses?${queryString}` : "/api/losses";
    return httpClient.get<PaginatedLosses>(url);
  }, "Failed to fetch losses: ");
}

export async function getLossAction(id: number): Promise<ActionResult<Loss>> {
  return executeHttpAction(
    () => httpClient.get<Loss>(`/api/losses/${id}`),
    "Failed to fetch loss: "
  );
}

export async function deleteLossAction(id: number): Promise<ActionResult> {
  return executeHttpAction(
    () => httpClient.delete(`/api/losses/${id}`),
    "Failed to delete loss: "
  );
}

export async function updateLossAction(
  id: number,
  input: Partial<CreateLossInput>
): Promise<ActionResult> {
  return executeHttpAction(
    () =>
      httpClient.put<unknown, Partial<CreateLossInput>>(
        `/api/losses/${id}`,
        input
      ),
    "Failed to update loss: "
  );
}
