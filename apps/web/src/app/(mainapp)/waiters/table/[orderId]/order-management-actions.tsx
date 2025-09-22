"use client";

import { redirect, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Switch } from "@workspace/ui/components/switch";
import { Label } from "@workspace/ui/components/label";
import type { CancelOrderAction, PayOrderAction } from "./actions";
import { OrderStatusEnum } from "@/graphql/generated/graphql";
import { cn } from "@workspace/ui/lib/utils";

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
  const isOrderServed = status === OrderStatusEnum.Served;

  const canCancel = useMemo(() => !isOrderCanceled, [isOrderCanceled]);
  const canPay = useMemo(
    () => !isOrderCanceled && !isOrderPayed,
    [isOrderCanceled, isOrderPayed]
  );
  const allowForcePayment = canPay && !isOrderServed;
  const canSubmitPayment = canPay && (isOrderServed || forcePayment);
  const payButtonDisabled = !canSubmitPayment || isPending;

  useEffect(() => {
    if (!hasRemainingMenus) {
      setForcePayment(false);
    }
  }, [hasRemainingMenus]);

  useEffect(() => {
    if (isOrderServed) {
      setForcePayment(false);
    }
  }, [isOrderServed]);

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
    if (!canSubmitPayment) return;

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
      <CardContent className="space-y-3 px-4 pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div
            className={cn(
              "flex items-center gap-3",
              !allowForcePayment && "opacity-50"
            )}
          >
            <Switch
              id="force-payment"
              disabled={!allowForcePayment || isPending}
              checked={forcePayment}
              onCheckedChange={(checked) => setForcePayment(Boolean(checked))}
            />
            <div className="flex flex-col">
              <Label
                htmlFor="force-payment"
                className={`text-xs sm:text-sm ${
                  allowForcePayment ? "text-gray-700" : "text-gray-400"
                }`}
              >
                Force payment
              </Label>
              <span className="text-[11px] sm:text-xs text-gray-500">
                {!isOrderPayed && !isOrderServed && (
                  <p className="text-xs sm:text-sm text-red-600">
                    This order is not fully served. Use{" "}
                    <strong>Force payment</strong> only if you really need to
                    bypass the service checks.
                  </p>
                )}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
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
              disabled={payButtonDisabled}
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
