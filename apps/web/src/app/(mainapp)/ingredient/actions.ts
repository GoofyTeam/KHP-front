"use server";

import { httpClient } from "@/lib/httpClient";

type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function moveIngredientQuantityAction(input: {
  ingredientId: string | number;
  from_location_id?: number | string;
  to_location_id?: number | string;
  quantity: number;
}): Promise<ActionResult> {
  try {
    const { ingredientId, quantity } = input;
    const fromCandidate = input.from_location_id ?? null;
    const toCandidate = input.to_location_id ?? null;

    if (fromCandidate == null || toCandidate == null) {
      return {
        success: false,
        error:
          "Missing required fields: from_location_id and to_location_id are required.",
      };
    }

    const toInt = (v: number | string): number => {
      if (typeof v === "number") return v;
      const parsed = parseInt(v, 10);
      if (Number.isNaN(parsed)) {
        throw new Error("Invalid location id value");
      }
      return parsed;
    };

    const payload = {
      from_location_id: toInt(fromCandidate),
      to_location_id: toInt(toCandidate),
      quantity,
    };

    let result: unknown;
    try {
      result = await httpClient.post<unknown, typeof payload>(
        `/api/ingredients/${ingredientId}/move-quantity`,
        payload
      );
    } catch (firstError) {
      if (
        firstError instanceof Error &&
        /^(404|405):/.test(firstError.message)
      ) {
        result = await httpClient.post<unknown, typeof payload>(
          `/ingredients/${ingredientId}/move-quantity`,
          payload
        );
      } else {
        throw firstError;
      }
    }

    return { success: true, data: result };
  } catch (e) {
    if (e instanceof Error) {
      const match = e.message.match(/^(\d{3}):\s*(.*)$/);
      if (match) {
        const status = Number(match[1]);
        const detail = match[2] || "";
        if (status === 401) {
          return { success: false, error: "Not authenticated (401)." };
        }
        if (status === 404) {
          return {
            success: false,
            error: "Ingredient or location not found (404).",
          };
        }
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
          return {
            success: false,
            error:
              "Invalid request (422). Ensure positive quantity and distinct locations.",
          };
        }
        return { success: false, error: detail || e.message };
      }
      return { success: false, error: e.message };
    }
    return { success: false, error: "Unknown error" };
  }
}
