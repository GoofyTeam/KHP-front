"use server";

import { httpClient } from "@/lib/httpClient";
import { revalidatePath } from "next/cache";
import type { Location } from "@workspace/graphql";

type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

export interface UpdateLocationInput {
  name?: string;
  location_type_id?: number;
  [key: string]: unknown;
}

export interface CreateLocationInput {
  name: string;
  location_type_id: number;
  [key: string]: unknown;
}

export async function updateLocationAction(
  locationId: string,
  input: UpdateLocationInput
): Promise<ActionResult<Location>> {
  try {
    const result = await httpClient.put<Location>(
      `/api/location/${locationId}`,
      input
    );

    revalidatePath("/settings/location");
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

export async function createLocationAction(
  input: CreateLocationInput
): Promise<ActionResult<Location>> {
  try {
    const result = await httpClient.post<Location>("/api/location", input);

    revalidatePath("/settings/location");
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

export async function deleteLocationAction(
  locationId: string
): Promise<ActionResult> {
  try {
    await httpClient.delete(`/api/location/${locationId}`);

    revalidatePath("/settings/location");
    return { success: true };
  } catch (e) {
    if (e instanceof Error) {
      if (e.message.includes("409")) {
        return {
          success: false,
          error:
            "Cannot delete location: it contains ingredients that must be moved first.",
        };
      }
      if (e.message.includes("404")) {
        return {
          success: false,
          error: "Location not found.",
        };
      }
    }

    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
