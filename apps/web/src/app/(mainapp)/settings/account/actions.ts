"use server";

import { cookies, headers } from "next/headers";

type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production" ? "https://dash.goofykhp.fr" : null);

async function getBaseUrl() {
  if (API_URL) return API_URL;
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

async function getXsrfHeader() {
  const c = await cookies();
  const token = c.get("XSRF-TOKEN")?.value;
  if (!token) return {} as Record<string, string>;
  try {
    return { "X-XSRF-TOKEN": decodeURIComponent(token) } as Record<
      string,
      string
    >;
  } catch {
    return { "X-XSRF-TOKEN": token } as Record<string, string>;
  }
}

export async function updateUserInfoAction(input: {
  name: string;
  email: string;
}): Promise<ActionResult> {
  try {
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const baseUrl = await getBaseUrl();
    const res = await fetch(
      new URL("/api/user/update/info", baseUrl).toString(),
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Cookie: cookieHeader,
          ...(await getXsrfHeader()),
        },
        body: JSON.stringify(input),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { success: false, error: text || res.statusText };
    }

    return { success: true };
  } catch (e) {
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
    const cookieHeader = (await headers()).get("cookie") ?? "";
    const baseUrl = await getBaseUrl();
    const res = await fetch(
      new URL("/api/user/update/password", baseUrl).toString(),
      {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Cookie: cookieHeader,
          ...(await getXsrfHeader()),
        },
        body: JSON.stringify(input),
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { success: false, error: text || res.statusText };
    }

    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
