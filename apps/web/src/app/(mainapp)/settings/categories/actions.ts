"use server";

import { httpClient } from "@/lib/httpClient";
import type { Category } from "@/graphql/generated/graphql";

export type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

function handleHttpError<T = unknown>(e: unknown): ActionResult<T> {
  if (e instanceof Error) {
    return { success: false, error: e.message };
  }
  return { success: false, error: "An unexpected error occurred" };
}

export interface CreateCategoryInput {
  name: string;
  shelf_lives: {
    fridge: number;
    freezer: number;
  };
  [location_type_id: string]:
    | number
    | string
    | { fridge: number; freezer: number }
    | undefined;
}

export interface UpdateCategoryInput {
  name?: string;
  shelf_lives?: {
    fridge: number;
    freezer: number;
  };
  [location_type_id: string]:
    | number
    | null
    | string
    | { fridge: number; freezer: number }
    | undefined;
}

export async function createCategoryAction(
  input: CreateCategoryInput
): Promise<ActionResult<Category>> {
  try {
    // Build API input according to POST /categories structure
    const apiInput: {
      name: string;
      shelf_lives: Record<string, number>;
    } = {
      name: input.name,
      shelf_lives: {
        fridge: input.shelf_lives.fridge * 24, // Convert days to hours for creation
        freezer: input.shelf_lives.freezer * 24, // Convert days to hours for creation
      },
    };

    // Handle other location types (convert days to hours)
    Object.keys(input).forEach((key) => {
      if (key !== "name" && key !== "shelf_lives") {
        const value = input[key];
        if (typeof value === "number" && value > 0) {
          apiInput.shelf_lives[key] = value * 24; // Convert days to hours
        }
      }
    });

    const response = await httpClient.post<
      { message: string; data: Category },
      typeof apiInput
    >("/api/categories", apiInput);
    const category = response.data;
    return { success: true, data: category };
  } catch (e) {
    return handleHttpError(e);
  }
}

export async function updateCategoryAction(
  id: string,
  input: UpdateCategoryInput
): Promise<ActionResult<Category>> {
  try {
    // Build API input according to PUT /categories/{id} structure
    const apiInput: {
      name?: string;
      shelf_lives?: Record<string, number | null>;
    } = {};

    // Add name if provided
    if (input.name) {
      apiInput.name = input.name;
    }

    // Initialize shelf_lives object
    apiInput.shelf_lives = {};

    // Handle fridge and freezer from shelf_lives structure (convert days to hours)
    if (input.shelf_lives) {
      if (input.shelf_lives.fridge > 0) {
        apiInput.shelf_lives.fridge = input.shelf_lives.fridge * 24;
      }
      if (input.shelf_lives.freezer > 0) {
        apiInput.shelf_lives.freezer = input.shelf_lives.freezer * 24;
      }
    }

    // Handle other location types (convert days to hours or set to null)
    Object.keys(input).forEach((key) => {
      if (key !== "name" && key !== "shelf_lives") {
        const value = input[key];
        if (typeof value === "number" && value > 0) {
          apiInput.shelf_lives![key] = value * 24; // Convert days to hours
        } else if (value === null || value === 0) {
          apiInput.shelf_lives![key] = null; // Remove location type
        }
      }
    });

    // Only send shelf_lives if it has properties
    if (Object.keys(apiInput.shelf_lives).length === 0) {
      delete apiInput.shelf_lives;
    }

    const response = await httpClient.put<
      { message: string; data: Category },
      typeof apiInput
    >(`/api/categories/${id}`, apiInput);
    const category = response.data;
    return { success: true, data: category };
  } catch (e) {
    return handleHttpError(e);
  }
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  try {
    await httpClient.delete(`/api/categories/${id}`);
    return { success: true };
  } catch (e) {
    return handleHttpError(e);
  }
}
