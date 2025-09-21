"use client";

import MenuToPrepareCard from "@/components/chefs/menu-to-prepare-card";
import {
  ChefsOrderStepsDocument,
  MenuServiceTypeEnum,
  OrderStatusEnum,
  StepMenuStatusEnum,
} from "@/graphql/generated/graphql";
import { NetworkStatus, useQuery } from "@apollo/client";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Separator } from "@workspace/ui/components/separator";
import { Loader2 } from "lucide-react";

function ChefsPage() {
  const {
    data: orderSteps,
    loading,
    error,
    refetch,
    networkStatus,
  } = useQuery(ChefsOrderStepsDocument, {
    pollInterval: 5000,
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
    notifyOnNetworkStatusChange: true,
  });

  const isInitialLoading =
    (!orderSteps || orderSteps.orderSteps.data.length === 0) &&
    loading &&
    networkStatus === NetworkStatus.loading;

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin text-khp-primary" size={64} />
        </div>
      </div>
    );
  }

  const visibleOrderStatuses = new Set<OrderStatusEnum>([
    OrderStatusEnum.Pending,
  ]);

  const stepsData = orderSteps?.orderSteps.data ?? [];

  const filteredSteps = stepsData.filter(
    (orderStep) =>
      orderStep.order && visibleOrderStatuses.has(orderStep.order.status)
  );

  const extractStepMenus = (targetStatus: StepMenuStatusEnum) =>
    filteredSteps.flatMap((orderStep) =>
      orderStep.stepMenus
        .filter(
          (stepMenu) =>
            stepMenu.menu?.service_type === MenuServiceTypeEnum.Prep &&
            stepMenu.status === targetStatus
        )
        .map((stepMenu) => ({ step: stepMenu, order: orderStep.order }))
    );

  const inPreparation = extractStepMenus(StepMenuStatusEnum.InPrep);
  const readyOrders = extractStepMenus(StepMenuStatusEnum.Ready);

  const activeOrderIds = new Set(
    [...inPreparation, ...readyOrders]
      .map(({ order }) => order?.id)
      .filter((orderId): orderId is string => Boolean(orderId))
  );

  const hasNoActiveOrders = inPreparation.length === 0 && readyOrders.length === 0;

  return (
    <div className="w-full py-4 px-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
        <Card>
          <CardContent className="space-y-2 flex flex-col items-center justify-center min-h-24">
            <p className="text-2xl font-bold text-center text-blue-700">
              {activeOrderIds.size}
            </p>
            <p className="text-center text-sm">Awaiting services</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 flex flex-col items-center justify-center min-h-24">
            <p className="text-2xl font-bold text-center text-red-700">
              {inPreparation.length}
            </p>
            <p className="text-center text-sm">Currently in preparation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-2 flex flex-col items-center justify-center min-h-24">
            <p className="text-2xl font-bold text-center text-green-700">
              {readyOrders.length}
            </p>
            <p className="text-center text-sm">
              Waiting the rest of the service
            </p>
          </CardContent>
        </Card>
      </div>
      <Separator className="my-4" />
      {error && (
        <div className="text-red-600 text-center">
          Error loading orders: {error.message}
        </div>
      )}
      {!error && hasNoActiveOrders && (
        <div className="text-gray-600 text-center">
          No active orders at the moment.
        </div>
      )}
      <div>
        {inPreparation.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
            {inPreparation.map(({ step, order }) => (
              <MenuToPrepareCard
                key={step.id}
                menuItem={step}
                orderItem={order}
                onStatusChange={() => refetch()}
              />
            ))}
          </div>
        )}
        {readyOrders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 my-4">
            {readyOrders.map(({ step, order }) => (
              <MenuToPrepareCard
                key={step.id}
                menuItem={step}
                orderItem={order}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChefsPage;
