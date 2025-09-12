"use server";

import { httpClient } from "@/lib/httpClient";
import { revalidatePath } from "next/cache";
import type { MenuCategory } from "@/graphql/generated/graphql";

type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

export interface UpdateMenuCategoryInput {
  name?: string;
  [key: string]: unknown;
}

export interface CreateMenuCategoryInput {
  name: string;
  [key: string]: unknown;
}

export async function updateMenuCategoryAction(
  categoryId: string,
  input: UpdateMenuCategoryInput
): Promise<ActionResult<MenuCategory>> {
  try {
    const result = await httpClient.put<MenuCategory>(
      `/api/menu-categories/${categoryId}`,
      input
    );

    revalidatePath("/settings/menu-categories");
    return { success: true, data: result };
  } catch (e) {
    if (e instanceof Error && e.message.includes("422")) {
      try {
        const errorMatch = e.message.match(/422: (.+)/);
        if (errorMatch) {
          const errorData = JSON.parse(errorMatch[1]);
          if (errorData.errors) {
            const firstError = Object.values(errorData.errors)[0];
            const errorMessage = Array.isArray(firstError)
              ? firstError[0]
              : String(firstError);
            return {
              success: false,
              error: `Validation error: ${errorMessage}`,
            };
          }
        }
      } catch {}
    }

    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

export async function createMenuCategoryAction(
  input: CreateMenuCategoryInput
): Promise<ActionResult<MenuCategory>> {
  try {
    const result = await httpClient.post<MenuCategory>(
      "/api/menu-categories",
      input
    );

    revalidatePath("/settings/menu-categories");
    return { success: true, data: result };
  } catch (e) {
    if (e instanceof Error && e.message.includes("422")) {
      try {
        const errorMatch = e.message.match(/422: (.+)/);
        if (errorMatch) {
          const errorData = JSON.parse(errorMatch[1]);
          if (errorData.errors) {
            const firstError = Object.values(errorData.errors)[0];
            const errorMessage = Array.isArray(firstError)
              ? firstError[0]
              : String(firstError);
            return {
              success: false,
              error: `Validation error: ${errorMessage}`,
            };
          }
        }
      } catch {}
    }

    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}

export async function deleteMenuCategoryAction(
  categoryId: string
): Promise<ActionResult> {
  try {
    await httpClient.delete(`/api/menu-categories/${categoryId}`);

    revalidatePath("/settings/menu-categories");
    return { success: true };
  } catch (e) {
    if (e instanceof Error) {
      if (e.message.includes("409")) {
        return {
          success: false,
          error:
            "Cannot delete category: it contains menus that must be moved first.",
        };
      }
      if (e.message.includes("404")) {
        return {
          success: false,
          error: "Category not found.",
        };
      }
    }

    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
