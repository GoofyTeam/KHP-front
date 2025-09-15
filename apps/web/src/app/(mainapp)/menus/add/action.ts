"use server";

import { CreateMenuFormValues } from "@/app/(mainapp)/menus/add/page";
import { httpClient } from "@/lib/httpClient";
import { UpdateMenuFormValues } from "../[id]/edit/page";

export async function createMenuAction(data: CreateMenuFormValues) {
  try {
    const formData = new FormData();

    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    formData.append("price", String(data.price));
    formData.append("is_a_la_carte", data.is_a_la_carte ? "1" : "0");
    formData.append("type", data.type);

    if (Array.isArray(data.category_ids)) {
      for (const id of data.category_ids) {
        formData.append("category_ids[]", id);
      }
    }

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

export async function updateMenuAction(id: string, data: UpdateMenuFormValues) {
  try {
    const formData = new FormData();
    formData.append("_method", "PUT");

    if (data.name) formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (data.price) formData.append("price", String(data.price));
    if (data.is_a_la_carte !== undefined)
      formData.append("is_a_la_carte", data.is_a_la_carte ? "1" : "0");
    if (data.type) formData.append("type", data.type);
    // Arrays
    if (Array.isArray(data.category_ids)) {
      for (const id of data.category_ids) {
        formData.append("category_ids[]", id);
      }
    }

    if (Array.isArray(data.items)) {
      data.items.forEach((item, index) => {
        formData.append(`items[${index}][entity_id]`, item.entity_id);
        formData.append(`items[${index}][entity_type]`, item.entity_type);
        formData.append(`items[${index}][quantity]`, String(item.quantity));
        formData.append(`items[${index}][unit]`, item.unit);
        formData.append(`items[${index}][location_id]`, item.location_id);
      });
    }

    if (data.image && data.image instanceof File) {
      formData.append("image", data.image);
    }

    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    await httpClient.post(`/api/menus/${id}`, formData);

    return { success: true };
  } catch (error) {
    console.error("Error updating menu:", error);
    console.log(JSON.stringify(error, null, 2));

    return { success: false, error: "Failed to update menu", details: error };
  }
}
