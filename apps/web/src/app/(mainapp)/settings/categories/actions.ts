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
  location_types?: {
    location_type_id: string;
    days: number;
  }[];
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
    // Convert days to hours for the API
    const apiInput = {
      name: input.name,
      shelf_lives: {
        fridge: input.shelf_lives.fridge * 24, // days to hours
        freezer: input.shelf_lives.freezer * 24, // days to hours
      },
      ...(input.location_types &&
        input.location_types.length > 0 && {
          location_types: input.location_types.map((lt) => ({
            location_type_id: lt.location_type_id,
            days: lt.days * 24, // Convert days to hours if needed by API
          })),
        }),
    };

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
    const apiInput: any = {};

    // Add name if provided
    if (input.name) {
      apiInput.name = input.name;
    }

    // Add shelf_lives if provided (convert days to hours)
    if (input.shelf_lives) {
      apiInput.shelf_lives = {
        fridge: input.shelf_lives.fridge * 24, // days to hours
        freezer: input.shelf_lives.freezer * 24, // days to hours
      };
    }

    Object.keys(input).forEach((key) => {
      if (key !== "name" && key !== "shelf_lives") {
        const value = input[key];
        if (typeof value === "number" && value > 0) {
          if (!apiInput.shelf_lives) {
            apiInput.shelf_lives = {};
          }
          apiInput.shelf_lives[key] = value * 24;
        } else if (value === null || value === 0) {
          if (!apiInput.shelf_lives) {
            apiInput.shelf_lives = {};
          }
          apiInput.shelf_lives[key] = null;
        }
      }
    });

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
