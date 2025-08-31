"use server";

import { httpClient } from "@/lib/httpClient";
import type { RequestData } from "@/lib/httpClient";

type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

export interface CreateLossInput extends RequestData {
  trackable_id: number;
  trackable_type: "ingredient" | "preparation";
  location_id: number;
  quantity: number;
  reason: string;
}

export async function createLossAction(
  input: CreateLossInput
): Promise<ActionResult> {
  try {
    await httpClient.post<unknown, CreateLossInput>("/api/losses", input);
    return { success: true };
  } catch (e) {
    if (e instanceof Error) {
      // httpClient throws `${status}: ${text}` when available
      const match = e.message.match(/^(\d{3}):\s*(.*)$/);
      if (match) {
        const status = Number(match[1]);
        const detail = match[2] || "";

        if (status === 401) return { success: false, error: "Unauthorized" };

        if (status === 422) {
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

        if (status === 400) {
          return {
            success: false,
            error: "Insufficient stock or inappropriate location",
          };
        }

        return { success: false, error: detail || e.message };
      }

      return { success: false, error: e.message };
    }
    return { success: false, error: "Unknown error" };
  }
}
