"use server";

import { httpClient } from "@/lib/httpClient";
import { query } from "@/lib/ApolloClient";
import { GetIngredientsDocument } from "@workspace/graphql";
import { type ActionResult, executeHttpAction } from "@/lib/actionUtils";

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
  return executeHttpAction(
    () =>
      httpClient.post<{ ingredient_ids?: number[] }>(
        "/api/ingredients/bulk",
        input
      ),
    "Failed to bulk create ingredients: "
  );
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
  return executeHttpAction(
    () =>
      httpClient.post<{ ingredient_ids?: number[] }>(
        "/api/ingredients/bulk",
        formData
      ),
    "Failed to bulk create ingredients with images: "
  );
}

export async function createIngredientUploadAction(
  formData: FormData
): Promise<ActionResult<{ id?: number }>> {
  return executeHttpAction(
    () => httpClient.post<{ id?: number }>("/api/ingredients", formData),
    "Failed to create ingredient: "
  );
}

export async function findIngredientByNameAction(
  name: string
): Promise<ActionResult<{ id?: number }>> {
  return executeHttpAction(async () => {
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
    if (!match?.id) return {};
    return { id: Number(match.id) };
  }, "Failed to find ingredient by name: ");
}

export async function addQuantitiesToIngredientAction(
  ingredientId: number,
  quantities: IngredientQuantityInput[]
): Promise<ActionResult> {
  return executeHttpAction(async () => {
    for (const q of quantities) {
      await httpClient.post(`/api/ingredients/${ingredientId}/add-quantity`, {
        location_id: q.location_id,
        quantity: q.quantity,
      });
    }
    return undefined; // No data to return
  }, "Failed to add quantities to ingredient: ");
}
