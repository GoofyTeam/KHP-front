"use server";

import { httpClient } from "@/lib/httpClient";
import { type ActionResult, executeHttpAction } from "@/lib/actionUtils";

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
  return executeHttpAction(
    () =>
      httpClient.put<QuickAccessResponse, QuickAccessUpdateData>(
        "/api/quick-access",
        input
      ),
    "Failed to update quick access: "
  );
}

export async function resetQuickAccessAction(): Promise<
  ActionResult<QuickAccessResponse>
> {
  return executeHttpAction(
    () => httpClient.post<QuickAccessResponse>("/api/quick-access/reset"),
    "Failed to reset quick access: "
  );
}
