"use server";

import type { CreateMenuFormValues } from "@/app/(mainapp)/preparations/add/page";
import { httpClient } from "@/lib/httpClient";

export async function createPreparationAction(data: CreateMenuFormValues) {
  try {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("unit", data.unit);
    formData.append("base_quantity", String(data.base_quantity));
    formData.append("base_unit", data.base_unit);
    formData.append("category_id", String(data.category_id));

    if (Array.isArray(data.entities)) {
      data.entities.forEach((entity, index) => {
        formData.append(`entities[${index}][id]`, entity.id);
        formData.append(`entities[${index}][type]`, entity.type);
        formData.append(
          `entities[${index}][quantity]`,
          String(entity.quantity),
        );
        formData.append(`entities[${index}][unit]`, entity.unit);
        formData.append(`entities[${index}][location_id]`, entity.location_id);
      });
    }

    if (data.image && data.image instanceof File) {
      formData.append("image", data.image);
    }

    await httpClient.post("/api/preparations", formData);

    return { success: true } as const;
  } catch (error) {
    console.error("Error creating preparation:", error);
    return {
      success: false,
      error: "Failed to create preparation",
      details: error,
    } as const;
  }
}
