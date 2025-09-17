"use server";

import type { UpdatePreparationFormValues } from "./page";
import { httpClient } from "@/lib/httpClient";
import { executeHttpAction, type ActionResult } from "@/lib/actionUtils";

export async function updatePreparationAction(
  id: string,
  data: UpdatePreparationFormValues
): Promise<ActionResult> {
  return executeHttpAction(async () => {
    const formData = new FormData();
    formData.append("_method", "PUT");

    if (data.name) {
      formData.append("name", data.name);
    }

    if (data.unit) {
      formData.append("unit", data.unit);
    }

    if (data.base_quantity !== undefined && data.base_quantity !== "") {
      formData.append("base_quantity", String(data.base_quantity));
    }

    if (data.base_unit) {
      formData.append("base_unit", data.base_unit);
    }

    if (data.category_id) {
      formData.append("category_id", data.category_id);
    }

    if (Array.isArray(data.entities)) {
      data.entities.forEach((entity, index) => {
        formData.append(`entities[${index}][id]`, entity.id);
        formData.append(`entities[${index}][type]`, entity.type);
        formData.append(`entities[${index}][quantity]`, String(entity.quantity));
        formData.append(`entities[${index}][unit]`, entity.unit);
        formData.append(`entities[${index}][location_id]`, entity.location_id);
      });
    }

    if (data.image && data.image instanceof File) {
      formData.append("image", data.image);
    }

    return httpClient.post(`/api/preparations/${id}`, formData);
  }, "Failed to update preparation: ");
}
