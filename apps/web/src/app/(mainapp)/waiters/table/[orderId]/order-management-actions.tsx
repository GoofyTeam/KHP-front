"use client";

import { redirect, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
import { Label } from "@workspace/ui/components/label";
import type { CancelOrderAction, PayOrderAction } from "./actions";
import { OrderStatusEnum } from "@/graphql/generated/graphql";

interface OrderManagementActionsProps {
  status: OrderStatusEnum;
  hasRemainingMenus: boolean;
  cancelOrder: CancelOrderAction;
  payOrder: PayOrderAction;
}

function OrderManagementActions({
  status,
  hasRemainingMenus,
  cancelOrder,
  payOrder,
}: OrderManagementActionsProps) {
  const router = useRouter();
  const [forcePayment, setForcePayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"cancel" | "pay" | null>(
    null
  );
  const [isPending, startTransition] = useTransition();

  const isOrderCanceled = status === OrderStatusEnum.Canceled;
  const isOrderPayed = status === OrderStatusEnum.Payed;

  const canCancel = useMemo(() => !isOrderCanceled, [isOrderCanceled]);
  const canPay = useMemo(
    () => !isOrderCanceled && !isOrderPayed,
    [isOrderCanceled, isOrderPayed]
  );

  useEffect(() => {
    if (!hasRemainingMenus) {
      setForcePayment(false);
    }
  }, [hasRemainingMenus]);

  const handleCancel = () => {
    if (!canCancel) return;

    setError(null);
    setPendingAction("cancel");

    startTransition(async () => {
      const result = await cancelOrder();

      if (!result.success) {
        setError(result.error);
      } else {
        setForcePayment(false);
        router.refresh();
        redirect("/waiters");
      }
    });
  };

  const handlePay = () => {
    if (!canPay) return;

    setError(null);
    setPendingAction("pay");

    startTransition(async () => {
      const result = await payOrder(forcePayment ? { force: true } : {});

      if (!result.success) {
        setError(result.error);
      } else {
        router.refresh();
        redirect("/waiters");
      }
    });
  };

  return (
    <Card className="khp-card">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="text-base">Manage order</CardTitle>
        <div className="text-sm text-gray-500">
          Current status:{" "}
          <span className="font-medium text-gray-700">{status}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isOrderPayed && hasRemainingMenus && (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-md">
            Some menus are not served yet. Enable force payment to bypass this
            check.
          </p>
        )}

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Switch
              id="force-payment"
              disabled={!canPay || (!hasRemainingMenus && !forcePayment)}
              checked={forcePayment}
              onCheckedChange={(checked) => setForcePayment(Boolean(checked))}
            />
            <Label
              htmlFor="force-payment"
              className={`text-sm ${
                !hasRemainingMenus ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Force payment
            </Label>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
            <Button
              variant="khp-destructive"
              className="sm:w-auto w-full"
              onClick={handleCancel}
              disabled={!canCancel || isPending}
            >
              {pendingAction === "cancel" ? "Cancelling..." : "Cancel order"}
            </Button>
            <Button
              variant="khp-default"
              className="sm:w-auto w-full"
              onClick={handlePay}
              disabled={!canPay || isPending}
            >
              {pendingAction === "pay" ? "Processing..." : "Mark as paid"}
            </Button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </CardContent>
    </Card>
  );
}

export default OrderManagementActions;
