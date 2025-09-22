"use server";

import { type ActionResult, executeHttpAction } from "@/lib/actionUtils";
import { httpClient } from "@/lib/httpClient";

export type CreateOrderForTableAction = (
  tableId: string
) => Promise<ActionResult<{ orderId: string }>>;

export async function createOrderForTableAction(
  tableId: string
): Promise<ActionResult<{ orderId: string }>> {
  return executeHttpAction(async () => {
    const response = await httpClient.post<{
      data?: { id?: number | string };
      order?: { id?: number | string };
      id?: number | string;
    }>("/api/orders", {
      table_id: Number(tableId),
    });

    const orderPayload = response?.data ?? response?.order ?? response;
    const orderId = orderPayload?.id ?? response?.id;

    if (!orderId) {
      throw new Error("Failed to create order: missing identifier");
    }

    return { orderId: String(orderId) };
  }, "Failed to create order: ");
}
