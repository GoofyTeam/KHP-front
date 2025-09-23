"use server";

import { httpClient } from "@/lib/httpClient";
import { revalidatePath } from "next/cache";
import type { LocationType } from "@workspace/graphql";

type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

export interface UpdateLocationTypeInput {
  name: string;
  [key: string]: unknown;
}

export interface CreateLocationTypeInput {
  name: string;
  [key: string]: unknown;
}

export async function updateLocationTypeAction(
  locationTypeId: string,
  input: UpdateLocationTypeInput
): Promise<ActionResult<LocationType>> {
  try {
    const result = await httpClient.put<LocationType>(
      `/api/location-types/${locationTypeId}`,
      input
    );

    revalidatePath("/settings/location-types");
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

export async function createLocationTypeAction(
  input: CreateLocationTypeInput
): Promise<ActionResult<LocationType>> {
  try {
    const result = await httpClient.post<LocationType>(
      "/api/location-types",
      input
    );

    revalidatePath("/settings/location-types");
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

export async function deleteLocationTypeAction(
  locationTypeId: string
): Promise<ActionResult> {
  try {
    await httpClient.delete(`/api/location-types/${locationTypeId}`);

    revalidatePath("/settings/location-types");
    return { success: true };
  } catch (e) {
    if (e instanceof Error) {
      if (e.message.includes("409")) {
        return {
          success: false,
          error:
            "Cannot delete location type: it is being used by existing locations.",
        };
      }
      if (e.message.includes("404")) {
        return {
          success: false,
          error: "Location type not found.",
        };
      }
    }

    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
