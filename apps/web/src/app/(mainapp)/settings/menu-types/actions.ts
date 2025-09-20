"use server";

import { revalidatePath } from "next/cache";
import type { MenuType } from "@/graphql/generated/graphql";
import { httpClient } from "@/lib/httpClient";

type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

interface BaseMenuTypeInput {
  name?: string;
  public_index?: number | null;
  [key: string]: unknown;
}

export interface CreateMenuTypeInput extends BaseMenuTypeInput {
  name: string;
}

export type UpdateMenuTypeInput = BaseMenuTypeInput;

function sanitizePayload<T extends BaseMenuTypeInput>(input: T) {
  const payload: Record<string, unknown> = {};

  if (typeof input.name === "string") {
    payload.name = input.name.trim();
  }

  if (input.public_index !== undefined && input.public_index !== null) {
    const numericIndex = Number(input.public_index);
    payload.public_index = Number.isFinite(numericIndex)
      ? Math.max(0, Math.trunc(numericIndex))
      : 0;
  }

  return payload;
}

function extractValidationErrorMessage(error: unknown) {
  if (!(error instanceof Error)) return null;

  if (!error.message.includes("422")) return null;

  try {
    const match = error.message.match(/422: (.+)/);
    if (!match) return null;

    const parsed = JSON.parse(match[1]);
    if (parsed?.errors) {
      const firstKey = Object.keys(parsed.errors)[0];
      const message = parsed.errors[firstKey];
      if (Array.isArray(message)) {
        return `Validation error: ${message[0]}`;
      }
      if (typeof message === "string") {
        return `Validation error: ${message}`;
      }
    }
  } catch (parseError) {
    console.error("Failed to parse validation error", parseError);
  }

  return "Validation error";
}

function revalidateMenuTypePages() {
  revalidatePath("/settings/menu-types");
  revalidatePath("/settings/public-menus");
}

export async function createMenuTypeAction(
  input: CreateMenuTypeInput
): Promise<ActionResult<MenuType>> {
  try {
    const payload = sanitizePayload(input);

    const result = await httpClient.post<MenuType>("/api/menu-types", payload);

    revalidateMenuTypePages();

    return { success: true, data: result };
  } catch (error) {
    const validationMessage = extractValidationErrorMessage(error);
    if (validationMessage) {
      return {
        success: false,
        error: validationMessage,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function updateMenuTypeAction(
  menuTypeId: string,
  input: UpdateMenuTypeInput
): Promise<ActionResult<MenuType>> {
  try {
    const payload = sanitizePayload(input);

    const result = await httpClient.put<MenuType>(
      `/api/menu-types/${menuTypeId}`,
      payload
    );

    revalidateMenuTypePages();

    return { success: true, data: result };
  } catch (error) {
    const validationMessage = extractValidationErrorMessage(error);
    if (validationMessage) {
      return {
        success: false,
        error: validationMessage,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteMenuTypeAction(
  menuTypeId: string
): Promise<ActionResult> {
  try {
    await httpClient.delete(`/api/menu-types/${menuTypeId}`);

    revalidateMenuTypePages();

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("404")) {
        return {
          success: false,
          error: "Menu type not found.",
        };
      }

      if (error.message.includes("422")) {
        return {
          success: false,
          error:
            "Cannot delete this menu type because it is still linked to existing menus.",
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
