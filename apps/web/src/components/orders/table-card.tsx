"use client";

import { GetRoomsQuery } from "@workspace/graphql";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import OrderStatusBadge from "@workspace/ui/components/order-status-badge";
import { getCorrectIcon } from "@workspace/ui/lib/order";
import { format } from "date-fns";
import { useEffect, useState } from "react";

function TableCard({
  table,
}: {
  table: GetRoomsQuery["rooms"]["data"][number]["tables"][number];
}) {
  const [elapsedMinutes, setElapsedMinutes] = useState<string | null>(null);

  const order =
    table.orders && table.orders.length > 0 ? table.orders[0] : null;
  const Icon = getCorrectIcon(order ? order.status : "READY");

  useEffect(() => {
    if (!order) return;
    const created = new Date(order.created_at);

    const update = () => {
      const diffMs = Date.now() - created.getTime();
      setElapsedMinutes(Math.floor(diffMs / 60000).toString());
    };

    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [order, order?.created_at]);

  return (
    <Card className="w-full border border-khp-primary/20 rounded-md hover:shadow-lg transition hover:bg-khp-primary/10">
      <CardHeader>
        <CardTitle>{table.label}</CardTitle>
        <CardDescription className="flex items-center w-full my-1 gap-x-2">
          <OrderStatusBadge status={order ? order.status : "READY"} />
          <p>Seats : {table.seats}</p>
        </CardDescription>
        <CardAction>
          <Icon className="text-khp-primary" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-y-0.5 text-left text-xs text-green-800 min-h-18 justify-center">
        {order && (
          <>
            <p>Total : {order ? order.price.toFixed(2) : "0.00"}€</p>
            <p>Since : {format(new Date(order.created_at), "HH:mm")}</p>
            <p>Elapsed : {elapsedMinutes} min</p>
          </>
        )}
        {!order && (
          <p className="text-green-800 font-semibold">Tap to start new order</p>
        )}
      </CardContent>
    </Card>
  );
}

export default TableCard;
