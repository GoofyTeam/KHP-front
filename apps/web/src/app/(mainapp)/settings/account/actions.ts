"use server";

import { httpClient } from "@/lib/httpClient";
import { query } from "@/lib/ApolloClient";
import { GetMeDocument, type GetMeQuery } from "@/graphql/generated/graphql";
import {
  type ActionResult,
  handleActionError,
  executeHttpAction,
} from "@/lib/actionUtils";

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

export async function getUserAction(): Promise<ActionResult<GetMeQuery["me"]>> {
  try {
    const { data, error } = await query({
      query: GetMeDocument,
      variables: {},
    });

    if (error) {
      console.error("GraphQL error:", error);
      return { success: false, error: "Failed to fetch user data" };
    }

    if (!data?.me) {
      return { success: false, error: "User not found" };
    }

    return { success: true, data: data.me };
  } catch (error) {
    return handleActionError(error, "Failed to fetch user: ");
  }
}
