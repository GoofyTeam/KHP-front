"use server";

import { httpClient } from "@/lib/httpClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

function handleError<T = unknown>(
  error: unknown,
  prefix = ""
): ActionResult<T> {
  if (error instanceof Error && error.message.includes("422")) {
    try {
      const errorMatch = error.message.match(/422: (.+)/);
      if (errorMatch) {
        const errorData = JSON.parse(errorMatch[1]);
        if (errorData.errors) {
          const firstError = Object.values(errorData.errors)[0];
          const errorMessage = Array.isArray(firstError)
            ? firstError[0]
            : String(firstError);
          return {
            success: false,
            error: `${prefix}${errorMessage}`,
          };
        }
      }
    } catch {}
  }

  return {
    success: false,
    error: error instanceof Error ? error.message : "Unknown error",
  };
}

async function executeHttpAction<T>(
  httpCall: () => Promise<T>,
  errorPrefix = ""
): Promise<ActionResult<T>> {
  try {
    const result = await httpCall();
    return { success: true, data: result };
  } catch (error) {
    return handleError(error, errorPrefix);
  }
}

export async function updateUserInfoAction(input: {
  name?: string;
  email?: string;
}): Promise<ActionResult> {
  return executeHttpAction(
    () => httpClient.put<unknown>("/api/user/update/info", input),
    "Validation error: "
  );
}

export async function updatePasswordAction(input: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}): Promise<ActionResult> {
  return executeHttpAction(
    () => httpClient.put("/api/user/update/password", input),
    "Password validation error: "
  );
}

export async function logoutAction(forceLogout = false): Promise<ActionResult> {
  try {
    await httpClient.post("/api/logout");
  } catch {}

  // Seulement supprimer les cookies si forceLogout est true
  if (forceLogout) {
    try {
      const cookieStore = await cookies();
      ["auth_token", "XSRF-TOKEN", "khp_session"].forEach((cookie) =>
        cookieStore.delete(cookie)
      );
    } catch {}
  }

  redirect("/login");
}
