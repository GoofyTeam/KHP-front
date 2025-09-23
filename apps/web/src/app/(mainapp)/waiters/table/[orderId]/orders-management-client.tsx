"use client";

import TakinOrders from "@/components/orders/takin-orders";
import {
  OrderStatusEnum,
  StepMenuStatusEnum,
  TakinOrdersQueryDocument,
  type TakinOrdersQueryQuery,
} from "@/graphql/generated/graphql";
import { useQuery } from "@apollo/client";
import { Badge } from "@workspace/ui/components/badge";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import type {
  AddStepMenuAction,
  CancelOrderAction,
  CancelStepMenuAction,
  CreateOrderStepAction,
  MarkStepMenuServedAction,
  PayOrderAction,
} from "./actions";
import OrderManagementActions from "./order-management-actions";

interface OrdersManagementClientProps {
  orderId: string;
  actions: {
    createStep: CreateOrderStepAction;
    addMenuToStep: AddStepMenuAction;
    cancelStepMenu: CancelStepMenuAction;
    markStepMenuServed: MarkStepMenuServedAction;
    cancelOrder: CancelOrderAction;
    payOrder: PayOrderAction;
  };
}

function OrdersManagementClient({
  orderId,
  actions,
}: OrdersManagementClientProps) {
  const { data, loading, error, refetch } = useQuery(TakinOrdersQueryDocument, {
    variables: { id: orderId },
    pollInterval: 1000, // Poll every second for real-time updates
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
  });

  const order = data?.order ?? null;
  const table = order?.table ?? null;
  const availableMenus = data?.menus?.data ?? [];

  const { latestStepId, hasRemainingMenus } = useMemo(() => {
    if (!order?.steps) {
      return { latestStepId: null, hasRemainingMenus: false };
    }

    const orderedSteps = [...order.steps].sort(
      (a, b) => a.position - b.position,
    );
    const lastStepId =
      orderedSteps.length > 0 ? orderedSteps[orderedSteps.length - 1].id : null;
    const remainingMenus = order.steps.some((step) =>
      step.stepMenus.some((menu) => menu.status !== StepMenuStatusEnum.Served),
    );

    return { latestStepId: lastStepId, hasRemainingMenus: remainingMenus };
  }, [order]);

  if (loading && !order) {
    return (
      <div className="flex-1 p-6">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-10 w-10 animate-spin text-khp-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto bg-red-50 border border-red-200 text-red-700 rounded-md p-6">
          Unable to load order details. {error.message}
        </div>
      </div>
    );
  }

  if (!order || !table) {
    return (
      <div className="flex-1 p-6">
        <div className="max-w-4xl mx-auto bg-amber-50 border border-amber-200 text-amber-700 rounded-md p-6">
          Order not found or table is no longer available.
        </div>
      </div>
    );
  }

  console.log({ order });

  return (
    <div className="flex-1 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Table {table.label} - Order #{order.id}
              </h1>
            </div>
          </div>
          <Badge className="text-lg px-4 py-2 bg-khp-primary/10 text-khp-primary border-khp-primary/20 font-semibold">
            Total: {order.price.toFixed(2)}€
          </Badge>
        </div>

        <OrderManagementActions
          status={order.status || OrderStatusEnum.Pending}
          hasRemainingMenus={hasRemainingMenus}
          cancelOrder={actions.cancelOrder}
          payOrder={actions.payOrder}
        />

        <TakinOrders
          availableMenus={
            availableMenus as TakinOrdersQueryQuery["menus"]["data"]
          }
          tableCurrentOrder={order}
          initialStepId={latestStepId}
          actions={actions}
          onRefresh={async () => {
            try {
              await refetch();
            } catch {
              // Silently ignore refetch errors; polling will attempt again.
            }
          }}
        />
      </div>
    </div>
  );
}

export default OrdersManagementClient;
