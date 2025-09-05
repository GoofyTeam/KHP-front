"use server";

import { httpClient } from "@/lib/httpClient";
import type { RequestData } from "@/lib/httpClient";

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
    case 403:
      return { success: false, error: "Forbidden" };
    case 404:
      return { success: false, error: "Not found" };
    case 400:
      return {
        success: false,
        error: "Insufficient stock or inappropriate location",
      };
    case 422:
      return handleValidationError<T>(detail);
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
  trackable_id: number;
  trackable_type: "ingredient" | "preparation";
  location_id: number;
  quantity: number;
  reason: string;
}

export interface GetLossesInput extends RequestData {
  trackable_id?: number;
  trackable_type?: "ingredient" | "preparation";
  location_id?: number;
  page?: number;
  limit?: number;
}

export interface Loss {
  id: number;
  trackable_id: number;
  trackable_type: "ingredient" | "preparation";
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
  try {
    await httpClient.post<unknown, CreateLossInput>("/api/losses", input);
    return { success: true };
  } catch (e) {
    return handleHttpError(e);
  }
}

export async function getLossesAction(
  input: GetLossesInput = {}
): Promise<ActionResult<PaginatedLosses>> {
  try {
    const queryString = buildQueryString({
      trackable_id: input.trackable_id,
      trackable_type: input.trackable_type,
      location_id: input.location_id,
      page: input.page,
      limit: input.limit,
    });

    const url = queryString ? `/api/losses?${queryString}` : "/api/losses";
    const data = await httpClient.get<PaginatedLosses>(url);
    return { success: true, data };
  } catch (e) {
    return handleHttpError<PaginatedLosses>(e);
  }
}

export async function getLossAction(id: number): Promise<ActionResult<Loss>> {
  try {
    const data = await httpClient.get<Loss>(`/api/losses/${id}`);
    return { success: true, data };
  } catch (e) {
    return handleHttpError<Loss>(e);
  }
}

export async function deleteLossAction(id: number): Promise<ActionResult> {
  try {
    await httpClient.delete(`/api/losses/${id}`);
    return { success: true };
  } catch (e) {
    return handleHttpError(e);
  }
}

export async function updateLossAction(
  id: number,
  input: Partial<CreateLossInput>
): Promise<ActionResult> {
  try {
    await httpClient.put<unknown, Partial<CreateLossInput>>(
      `/api/losses/${id}`,
      input
    );
    return { success: true };
  } catch (e) {
    return handleHttpError(e);
  }
}
