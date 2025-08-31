"use server";

import { httpClient } from "@/lib/httpClient";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function updateUserInfoAction(input: {
  name?: string;
  email?: string;
}): Promise<ActionResult> {
  try {
    // Le HttpClient intelligent gère automatiquement les headers côté serveur
    const result = await httpClient.put<unknown>(
      "/api/user/update/info",
      input
    );
    return { success: true, data: result };
  } catch (e) {
    // Si c'est une erreur de validation, essayer de parser le message
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

export async function updatePasswordAction(input: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}): Promise<ActionResult> {
  try {
    console.log("🔐 Password update attempt");
    const result = await httpClient.put("/api/user/update/password", input);
    console.log("✅ Password updated successfully:", result);
    return { success: true, data: result };
  } catch (e) {
    console.error("❌ Password update failed:", e);

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
              error: `Password validation error: ${errorMessage}`,
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

export async function logoutAction(): Promise<ActionResult> {
  try {
    await httpClient.post("/api/logout");
  } catch {}

  try {
    const cookieStore = await cookies();
    cookieStore.delete("auth_token");
    cookieStore.delete("XSRF-TOKEN");
    cookieStore.delete("khp_session");
  } catch {
    // noop
  }

  redirect("/login");
}
