import { query } from "@/lib/ApolloClient";
import { TakinOrdersQueryDocument } from "@/graphql/generated/graphql";
import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import { ChevronLeft, Clock, MapPin, Calendar, XCircle } from "lucide-react";
import OrderStatusBadge from "@workspace/ui/components/order-status-badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { OrderStepsDisplay } from "@/components/orders/order-steps-display";
import { OrderSummary } from "@/components/orders/order-summary";

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data, error } = await query({
    query: TakinOrdersQueryDocument,
    variables: { id },
    fetchPolicy: "network-only",
  });

  if (error) {
    console.error("GraphQL error:", error);
    throw error;
  }

  const order = data.order;

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <XCircle className="h-16 w-16 text-khp-error" />
        <h1 className="text-2xl font-bold text-khp-text-primary">
          Order not found
        </h1>
        <p className="text-khp-text-secondary">
          The order you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/orders">Back to Orders</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 h-full py-2">
      {/* Left Column - Order Info */}
      <div className="flex flex-col gap-6 w-full lg:w-1/2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-khp-text-primary">
              Order #{order.id}
            </h1>
            <OrderStatusBadge status={order.status} size="large" />
          </div>

          {/* Order Meta Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-khp-text-secondary">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">
                Created:{" "}
                {format(new Date(order.created_at), "dd/MM/yyyy HH:mm", {
                  locale: fr,
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-khp-text-secondary">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Table {order.table.label}</span>
            </div>

            <div className="flex items-center gap-2 text-khp-text-secondary">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {order.status === "PENDING" &&
                  order.pending_at &&
                  `Pending since: ${format(new Date(order.pending_at), "HH:mm", { locale: fr })}`}
                {order.status === "SERVED" &&
                  order.served_at &&
                  `Served at: ${format(new Date(order.served_at), "HH:mm", { locale: fr })}`}
                {order.status === "PAYED" &&
                  order.payed_at &&
                  `Paid at: ${format(new Date(order.payed_at), "HH:mm", { locale: fr })}`}
                {order.status === "CANCELED" &&
                  order.canceled_at &&
                  `Canceled at: ${format(new Date(order.canceled_at), "HH:mm", { locale: fr })}`}
              </span>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <OrderSummary order={order} />

        {/* Back Button */}
        <div className="mt-auto">
          <Button variant="link" asChild>
            <Link href="/orders" className="text-khp-primary">
              <ChevronLeft /> Back to Orders
            </Link>
          </Button>
        </div>
      </div>

      {/* Right Column - Order Steps */}
      <div className="flex flex-col w-full lg:w-1/2 gap-4">
        <h2 className="text-xl font-semibold text-khp-text-primary">
          Order Steps
        </h2>
        <OrderStepsDisplay steps={order.steps} />
      </div>
    </div>
  );
}
