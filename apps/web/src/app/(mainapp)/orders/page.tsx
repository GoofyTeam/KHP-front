"use client";

import { useQuery } from "@apollo/client";
import { OrdersTable } from "@/components/orders/orders-columns";
import OrdersFilters from "@/components/orders/orders-filters";
import { GetOrdersDocument } from "@workspace/graphql";
import { useMemo } from "react";
import { useOrdersStore } from "@/stores/orders-store";

export default function OrdersPage() {
  const { setFilters, filters } = useOrdersStore();

  const { data } = useQuery(GetOrdersDocument, {
    variables: { first: 200, page: 1 },
    fetchPolicy: "cache-and-network",
  });

  const { rooms, tables } = useMemo(() => {
    const orders = data?.orders?.data ?? [];
    const roomsMap = new Map();
    const tablesArray: Array<{
      id: string;
      label: string;
      room: { id: string; name: string };
    }> = [];

    orders.forEach((order) => {
      if (order.table?.room) {
        roomsMap.set(order.table.room.id, {
          id: order.table.room.id,
          name: order.table.room.name,
        });
      }

      if (order.table) {
        tablesArray.push({
          id: order.table.id,
          label: order.table.label,
          room: order.table.room,
        });
      }
    });

    return {
      rooms: Array.from(roomsMap.values()),
      tables: tablesArray.filter(
        (table, index, self) =>
          index === self.findIndex((t) => t.id === table.id)
      ),
    };
  }, [data]);

  return (
    <div className="space-y-4">
      <OrdersFilters
        rooms={rooms}
        tables={tables}
        filters={filters}
        onFiltersChange={setFilters}
      />
      <OrdersTable />
    </div>
  );
}
