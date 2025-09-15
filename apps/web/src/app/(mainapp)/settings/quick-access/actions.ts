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

export interface QuickAccessUpdateInput {
  id: number;
  name?: string;
  icon?: string;
  icon_color?: "primary" | "warning" | "error" | "info";
  url_key?: string;
}

export interface QuickAccessUpdateData {
  quick_accesses: QuickAccessUpdateInput[];
  [key: string]: unknown;
}

export interface QuickAccessResponse {
  message: string;
  quick_accesses: Array<{
    id: number;
    company_id: number;
    index: number;
    name: string;
    icon: string;
    icon_color: string;
    url_key: string;
    created_at: string;
    updated_at: string;
  }>;
}

export async function updateQuickAccessAction(
  input: QuickAccessUpdateData
): Promise<ActionResult<QuickAccessResponse>> {
  try {
    const response = await httpClient.put<
      QuickAccessResponse,
      QuickAccessUpdateData
    >("/api/quick-access", input);
    return { success: true, data: response };
  } catch (e) {
    return handleHttpError(e);
  }
}

export async function resetQuickAccessAction(): Promise<
  ActionResult<QuickAccessResponse>
> {
  try {
    const response = await httpClient.post<QuickAccessResponse>(
      "/api/quick-access/reset"
    );
    return { success: true, data: response };
  } catch (e) {
    return handleHttpError(e);
  }
}
