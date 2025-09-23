"use server";

import { httpClient } from "@/lib/httpClient";
import { type ActionResult, executeHttpAction } from "@/lib/actionUtils";

export async function updateCompanyOptionsAction(input: {
  open_food_facts_language?: "fr" | "en";
}): Promise<ActionResult> {
  return executeHttpAction(
    () => httpClient.put<unknown>("/api/company/options", input),
    "Validation error: "
  );
}

export async function updateCompanyBusinessHoursAction(input: {
  business_hours: Array<{
    day_of_week: number;
    opens_at: string;
    closes_at: string;
    is_overnight?: boolean;
  }>;
}): Promise<ActionResult> {
  return executeHttpAction(
    () => httpClient.put<unknown>("/api/company/business-hours", input),
    "Validation error: "
  );
}

export async function updateCompanyLogoAction(input: {
  image?: File;
  image_url?: string;
}): Promise<ActionResult> {
  const formData = new FormData();

  if (input.image) {
    formData.append("image", input.image);
  }

  if (input.image_url) {
    formData.append("image_url", input.image_url);
  }

  return executeHttpAction(
    () => httpClient.post<unknown>("/api/company/logo", formData),
    "Validation error: "
  );
}

export async function updateCompanyContactAction(input: {
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address_line?: string;
  postal_code?: string;
  city?: string;
  country?: string;
}): Promise<ActionResult> {
  return executeHttpAction(
    () => httpClient.put<unknown>("/api/company/contact", input),
    "Validation error: "
  );
}
