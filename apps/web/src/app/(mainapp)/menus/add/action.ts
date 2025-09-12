"use server";

import { CreateMenuFormValues } from "@/app/(mainapp)/menus/add/page";
import { httpClient } from "@/lib/httpClient";

export async function createMenuAction(data: CreateMenuFormValues) {
  console.log("Creating menu with data:", {
    ...data,
    image: data.image ? ((data.image as File)?.name ?? "[binary]") : undefined,
  });

  try {
    const formData = new FormData();

    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    formData.append("price", String(data.price));
    formData.append("is_a_la_carte", data.is_a_la_carte ? "1" : "0");
    formData.append("type", data.type);

    // Arrays
    if (Array.isArray(data.category_ids)) {
      for (const id of data.category_ids) {
        formData.append("category_ids[]", id);
      }
    }

    // Complex array: send each item using bracket notation so Laravel parses it as an array
    if (Array.isArray(data.items)) {
      data.items.forEach((item, index) => {
        formData.append(`items[${index}][entity_id]`, item.entity_id);
        formData.append(`items[${index}][entity_type]`, item.entity_type);
        formData.append(`items[${index}][quantity]`, String(item.quantity));
        formData.append(`items[${index}][unit]`, item.unit);
        formData.append(`items[${index}][location_id]`, item.location_id);
      });
    }

    // File
    if (data.image && data.image instanceof File) {
      formData.append("image", data.image);
    }

    await httpClient.post("/api/menus", formData);

    return { success: true };
  } catch (error) {
    console.error("Error creating menu:", error);
    console.log(JSON.stringify(error, null, 2));

    return { success: false, error: "Failed to create menu", details: error };
  }
}
