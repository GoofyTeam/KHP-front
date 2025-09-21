"use server";

import { httpClient } from "@/lib/httpClient";
import { type ActionResult, executeHttpAction } from "@/lib/actionUtils";

export interface StepMenuPayload {
  menu_id: number;
  quantity: number;
  note?: string;
}

export interface CreateOrderStepInput {
  menus: StepMenuPayload[];
  [key: string]: unknown;
}

export type CreateOrderStepAction = (
  input: CreateOrderStepInput
) => Promise<ActionResult<unknown>>;

export async function createOrderStepAction(
  orderId: string,
  input: CreateOrderStepInput
): Promise<ActionResult<unknown>> {
  return executeHttpAction(
    () => httpClient.post(`/api/orders/${orderId}/steps`, input),
    "Failed to create order step: "
  );
}

export interface AddStepMenuInput {
  menu_id: number;
  quantity: number;
  note?: string;
  [key: string]: unknown;
}

export type AddStepMenuAction = (
  stepId: string,
  input: AddStepMenuInput
) => Promise<ActionResult<unknown>>;

export async function addStepMenuAction(
  orderId: string,
  stepId: string,
  input: AddStepMenuInput
): Promise<ActionResult<unknown>> {
  return executeHttpAction(
    () =>
      httpClient.post(`/api/orders/${orderId}/steps/${stepId}/menus`, input),
    "Failed to add menu to step: "
  );
}

export interface CancelStepMenuInput {
  quantity?: number;
  unopened_return?: boolean;
  [key: string]: unknown;
}

export type CancelStepMenuAction = (
  stepMenuId: string,
  input?: CancelStepMenuInput
) => Promise<ActionResult<unknown>>;

export async function cancelStepMenuAction(
  orderId: string,
  stepMenuId: string,
  input: CancelStepMenuInput = {}
): Promise<ActionResult<unknown>> {
  return executeHttpAction(
    () =>
      httpClient.post(
        `/api/orders/${orderId}/step-menus/${stepMenuId}/cancel`,
        input
      ),
    "Failed to cancel step menu: "
  );
}

export type MarkStepMenuServedAction = (
  stepMenuId: string
) => Promise<ActionResult<unknown>>;

export async function markStepMenuServedAction(
  orderId: string,
  stepMenuId: string
): Promise<ActionResult<unknown>> {
  return executeHttpAction(
    () =>
      httpClient.post(`/api/orders/${orderId}/step-menus/${stepMenuId}/served`),
    "Failed to mark step menu as served: "
  );
}

export interface CancelOrderInput {
  unopened_returns?: number[];
  [key: string]: unknown;
}

export type CancelOrderAction = (
  input?: CancelOrderInput
) => Promise<ActionResult<unknown>>;

export async function cancelOrderAction(
  orderId: string,
  input: CancelOrderInput = {}
): Promise<ActionResult<unknown>> {
  return executeHttpAction(
    () => httpClient.post(`/api/orders/${orderId}/cancel`, input),
    "Failed to cancel order: "
  );
}

export interface PayOrderInput {
  force?: boolean;
  [key: string]: unknown;
}

export type PayOrderAction = (
  input?: PayOrderInput
) => Promise<ActionResult<unknown>>;

export async function payOrderAction(
  orderId: string,
  input: PayOrderInput = {}
): Promise<ActionResult<unknown>> {
  return executeHttpAction(
    () => httpClient.post(`/api/orders/${orderId}/pay`, input),
    "Failed to mark order as paid: "
  );
}
