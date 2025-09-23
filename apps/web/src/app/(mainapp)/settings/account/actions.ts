"use server";

import { httpClient } from "@/lib/httpClient";
import { type ActionResult, executeHttpAction } from "@/lib/actionUtils";

export async function updateUserInfoAction(input: {
  name?: string;
  email?: string;
}): Promise<ActionResult> {
  return executeHttpAction(
    () => httpClient.put<unknown>("/api/user/update/info", input),
    "Validation error: ",
  );
}

export async function updatePasswordAction(input: {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}): Promise<ActionResult> {
  return executeHttpAction(
    () => httpClient.put("/api/user/update/password", input),
    "Password validation error: ",
  );
}
