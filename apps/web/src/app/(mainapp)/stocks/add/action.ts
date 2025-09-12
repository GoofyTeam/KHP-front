"use server";

import { httpClient } from "@/lib/httpClient";
import { query } from "@/lib/ApolloClient";
import { GetIngredientsDocument } from "@/graphql/generated/graphql";

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
    case 400:
      return { success: false, error: "Invalid request - check your data" };
    case 422:
      return handleValidationError(detail);
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

export type IngredientQuantityInput = {
  location_id: number;
  quantity: number;
};

export type IngredientBulkInput = {
  name: string;
  unit: string;
  category_id: number;
  quantities: IngredientQuantityInput[];
  base_quantity: number;
};

export type BulkCreateIngredientsInput = {
  ingredients: IngredientBulkInput[];
};

export async function bulkCreateIngredientsAction(
  input: BulkCreateIngredientsInput
): Promise<ActionResult<{ ingredient_ids?: number[] }>> {
  try {
    const data = await httpClient.post<{ ingredient_ids?: number[] }>(
      "/api/ingredients/bulk",
      input
    );

    return { success: true, data };
  } catch (e) {
    return handleHttpError(e);
  }
}

export type IngredientImageWire = {
  fileName: string;
  mimeType: string;
  base64: string;
};

export type IngredientBulkWithImageInput = {
  name: string;
  unit: string;
  category_id: number;
  quantities: IngredientQuantityInput[];
  base_quantity: number;
  image?: IngredientImageWire;
};

export type BulkCreateIngredientsWithImagesInput = {
  ingredients: IngredientBulkWithImageInput[];
};

export async function bulkCreateIngredientsUploadAction(
  formData: FormData
): Promise<ActionResult<{ ingredient_ids?: number[] }>> {
  try {
    const { headers, cookies } = await import("next/headers");
    const h = await headers();
    const c = await cookies();

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ??
      (process.env.NODE_ENV === "production"
        ? "https://dash.goofykhp.fr"
        : "http://localhost:8000");

    const cookieHeader = h.get("cookie") || "";
    const rawXsrf = c.get("XSRF-TOKEN")?.value;
    let decodedXsrf = "";
    try {
      if (rawXsrf) decodedXsrf = decodeURIComponent(rawXsrf);
    } catch {
      decodedXsrf = rawXsrf || "";
    }

    const upstream = await fetch(`${API_URL}/api/ingredients/bulk`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
        ...(decodedXsrf ? { "X-XSRF-TOKEN": decodedXsrf } : {}),
        "X-Requested-With": "XMLHttpRequest",
      },
      cache: "no-store",
    });

    if (!upstream.ok) {
      const errorText = await upstream.text().catch(() => "");
      return handleHttpError<{
        ingredient_ids?: number[];
      }>(new Error(`${upstream.status}: ${errorText || upstream.statusText}`));
    }

    const result = await upstream.json().catch(() => ({}));
    return { success: true, data: result };
  } catch (e) {
    return handleHttpError(e);
  }
}

export async function createIngredientUploadAction(
  formData: FormData
): Promise<ActionResult<{ id?: number }>> {
  try {
    const { headers, cookies } = await import("next/headers");
    const h = await headers();
    const c = await cookies();

    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ??
      (process.env.NODE_ENV === "production"
        ? "https://dash.goofykhp.fr"
        : "http://localhost:8000");

    const cookieHeader = h.get("cookie") || "";
    const rawXsrf = c.get("XSRF-TOKEN")?.value;
    let decodedXsrf = "";
    try {
      if (rawXsrf) decodedXsrf = decodeURIComponent(rawXsrf);
    } catch {
      decodedXsrf = rawXsrf || "";
    }

    const upstream = await fetch(`${API_URL}/api/ingredients`, {
      method: "POST",
      body: formData,
      credentials: "include",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
        ...(decodedXsrf ? { "X-XSRF-TOKEN": decodedXsrf } : {}),
        "X-Requested-With": "XMLHttpRequest",
      },
      cache: "no-store",
    });

    if (!upstream.ok) {
      const errorText = await upstream.text().catch(() => "");
      return handleHttpError<{
        id?: number;
      }>(new Error(`${upstream.status}: ${errorText || upstream.statusText}`));
    }

    const result = await upstream.json().catch(() => ({}));
    return { success: true, data: result };
  } catch (e) {
    return handleHttpError(e);
  }
}

export async function findIngredientByNameAction(
  name: string
): Promise<ActionResult<{ id?: number }>> {
  try {
    const { data } = await query({
      query: GetIngredientsDocument,
      variables: { page: 1, search: name },
      context: { fetchOptions: { cache: "no-store" } },
    });

    const list = (data?.ingredients?.data || []) as Array<{
      id?: string | number | null;
      name?: string | null;
    }>;
    const target = name.trim().toLowerCase();
    const match = list.find(
      (it) =>
        String(it?.name ?? "")
          .trim()
          .toLowerCase() === target
    );
    if (!match?.id) return { success: true, data: {} };
    return { success: true, data: { id: Number(match.id) } };
  } catch (e) {
    return handleHttpError(e);
  }
}

export async function addQuantitiesToIngredientAction(
  ingredientId: number,
  quantities: IngredientQuantityInput[]
): Promise<ActionResult> {
  try {
    for (const q of quantities) {
      await httpClient.post(`/api/ingredients/${ingredientId}/add-quantity`, {
        location_id: q.location_id,
        quantity: q.quantity,
      });
    }
    return { success: true };
  } catch (e) {
    return handleHttpError(e);
  }
}
