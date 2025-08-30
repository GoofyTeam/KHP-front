"use server";

import { cookies, headers } from "next/headers";
import { httpClient } from "@/lib/httpClient";

type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };


async function getServerHeaders() {
  const h = await headers();
  const c = await cookies();
  const cookieHeader = h.get("cookie") ?? "";
  const rawXsrf = c.get("XSRF-TOKEN")?.value;
  let xsrfHeader: Record<string, string> = {};
  if (rawXsrf) {
    try {
      xsrfHeader = { "X-XSRF-TOKEN": decodeURIComponent(rawXsrf) };
    } catch {
      xsrfHeader = { "X-XSRF-TOKEN": rawXsrf };
    }
  }
  return {
    Cookie: cookieHeader,
    ...xsrfHeader,
  } as Record<string, string>;
}

export async function updateUserInfoAction(input: {
  name: string;
  email: string;
}): Promise<ActionResult> {
  try {
    console.log("🔄 updateUserInfoAction called with:", input);
    const headers = await getServerHeaders();
    console.log("📤 Headers:", headers);

    const result = await httpClient.put<any>("/api/user/update/info", input, {
      headers,
      cache: "no-store",
    });

    console.log("✅ API response:", result);
    return { success: true };
  } catch (e) {
    console.error("❌ updateUserInfoAction error:", e);
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
    await httpClient.put("/api/user/update/password", input, {
      headers: await getServerHeaders(),
      cache: "no-store",
    });

    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
