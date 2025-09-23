"use server";

import { CreateMenuFormValues } from "@/app/(mainapp)/menus/add/page";
import { httpClient } from "@/lib/httpClient";
import { UpdateMenuFormValues } from "../[id]/edit/page";
import { type ActionResult, executeHttpAction } from "@/lib/actionUtils";

export async function createMenuAction(
  data: CreateMenuFormValues,
): Promise<ActionResult> {
  return executeHttpAction(() => {
    const formData = new FormData();

    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    formData.append("price", String(data.price));
    formData.append("is_a_la_carte", data.is_a_la_carte ? "1" : "0");
    formData.append("is_returnable", data.is_returnable ? "1" : "0");
    formData.append("menu_type_id", data.menu_type_id);
    formData.append("service_type", data.service_type);
    if (typeof data.priority === "number") {
      formData.append("priority", String(data.priority));
    }

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

    return httpClient.post("/api/menus", formData);
  }, "Failed to create menu: ");
}

export async function updateMenuAction(
  id: string,
  data: UpdateMenuFormValues,
): Promise<ActionResult> {
  return executeHttpAction(() => {
    const formData = new FormData();
    formData.append("_method", "PUT");

    if (data.name) formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    if (data.price) formData.append("price", String(data.price));
    if (data.is_a_la_carte !== undefined)
      formData.append("is_a_la_carte", data.is_a_la_carte ? "1" : "0");
    if (data.is_returnable !== undefined) {
      formData.append("is_returnable", data.is_returnable ? "1" : "0");
    }
    if (data.menu_type_id) {
      formData.append("menu_type_id", data.menu_type_id);
    }
    if (data.service_type) {
      formData.append("service_type", data.service_type);
    }
    if (data.priority !== undefined) {
      formData.append("priority", String(data.priority));
    }

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

    return httpClient.post(`/api/menus/${id}`, formData);
  }, "Failed to update menu: ");
}
