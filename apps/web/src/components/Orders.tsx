"use client";

import React from "react";
import { Clock, CheckCircle, XCircle, Banknote } from "lucide-react";
import Link from "next/link";
import { cn } from "@workspace/ui/lib/utils";
import { GetOrdersQuery } from "@/graphql/generated/graphql";
import { formatTime } from "@workspace/ui/lib/date-utils";

interface TableData {
  label: string;
}

interface OrderData {
  id: string;
  table?: TableData;
  price: number;
  status: OrderStatus;
  created_at: string;
}

// --- Types
export type OrderStatus = "PENDING" | "SERVED" | "PAYED" | "CANCELED";

export type OrderItem = {
  id: string | number;
  title: string;
  subtitle?: string;
  time?: string;
  status?: OrderStatus;
  onClick?: () => void;
};

export type OrdersProps = {
  data?: OrderItem[] | GetOrdersQuery | null;
  className?: string;
};

// --- Utilities

function getStatusIcon(status: string) {
  switch (status) {
    case "PENDING":
      return <Clock className="mt-0.5 h-4 w-4 text-khp-warning" aria-hidden />;
    case "SERVED":
      return (
        <CheckCircle className="mt-0.5 h-4 w-4 text-khp-info" aria-hidden />
      );
    case "PAYED":
      return (
        <Banknote className="mt-0.5 h-4 w-4 text-khp-primary" aria-hidden />
      );
    case "CANCELED":
      return <XCircle className="mt-0.5 h-4 w-4 text-khp-error" aria-hidden />;
    default:
      return <Clock className="mt-0.5 h-4 w-4 text-khp-warning" aria-hidden />;
  }
}

function getOrderStatusSummary(order: OrderData): string {
  switch (order.status) {
    case "PAYED":
      return "Paid";
    case "CANCELED":
      return "Canceled";
    case "SERVED":
      return "Served";
    case "PENDING":
    default:
      return "In preparation";
  }
}

function transformData(queryData: GetOrdersQuery): OrderItem[] {
  if (!queryData?.orders?.data) {
    return [];
  }

  return queryData.orders.data.map((order: OrderData) => {
    return {
      id: order.id,
      title: `Table ${order.table?.label} - ${order.price}€`,
      subtitle: getOrderStatusSummary(order),
      time: formatTime(order.created_at),
      status: order.status as OrderStatus,
    };
  });
}

function isQueryData(data: unknown): data is GetOrdersQuery {
  return Boolean(
    data && typeof data === "object" && data !== null && "orders" in data,
  );
}

function sortOrders(orders: OrderItem[]): OrderItem[] {
  return orders.sort((a, b) => {
    const statusPriority: Record<string, number> = {
      PENDING: 1,
      SERVED: 2,
      CANCELED: 3,
      PAYED: 4,
    };

    const priorityA = statusPriority[a.status || "PENDING"] || 5;
    const priorityB = statusPriority[b.status || "PENDING"] || 5;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    if (a.time && b.time) {
      const timeA = a.time.split(":").map(Number);
      const timeB = b.time.split(":").map(Number);

      if (timeA[0] !== timeB[0]) {
        return timeA[0] - timeB[0];
      }
      return timeA[1] - timeB[1];
    }

    return 0;
  });
}

function EmptyState() {
  return (
    <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-200 p-6 text-sm text-khp-text-secondary">
      No orders
    </div>
  );
}

// --- Main component
export function Orders({ data, className }: OrdersProps) {
  const transformedData: OrderItem[] = React.useMemo(() => {
    if (!data) return [];

    let orders: OrderItem[] = [];

    if (isQueryData(data)) {
      orders = transformData(data);
    } else if (Array.isArray(data)) {
      orders = data;
    }

    return sortOrders(orders);
  }, [data]);

  return (
    <section
      className={cn(
        "rounded-md border border-khp-primary/30 bg-white shadow-sm pt-2 flex flex-col min-h-0",
        className,
      )}
      aria-label="Orders"
    >
      <header className="mb-3 flex items-center justify-between gap-3 px-3 md:px-4 lg:px-5 shrink-0">
        <h2 className="text-lg font-semibold text-khp-text-primary">Orders</h2>

        <div className="flex items-center gap-2">
          <Link
            href="/orders"
            className="text-right py-1 text-xs font-medium text-khp-primary/90 underline hover:text-khp-primary-hover"
          >
            View all orders
          </Link>
        </div>
      </header>

      <div className="min-h-0 overflow-y-auto">
        {transformedData.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-slate-100">
            {transformedData.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="w-full text-left flex items-start gap-3 py-2.5 px-3 md:px-4 lg:px-5"
                  onClick={item.onClick}
                >
                  {getStatusIcon(item.status || "PENDING")}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-khp-text-primary">
                      {item.title}
                    </p>
                    {item.subtitle && (
                      <p className="mt-0.5 line-clamp-2 text-xs text-khp-text-secondary">
                        {item.subtitle}
                      </p>
                    )}
                  </div>

                  {item.time && (
                    <span className="shrink-0 text-xs text-khp-text-secondary">
                      {item.time}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
