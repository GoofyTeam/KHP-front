"use client";

import TableCard from "@/components/orders/table-card";
import type { GetRoomsQuery } from "@/graphql/generated/graphql";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import type { CreateOrderForTableAction } from "./actions";

type Room = NonNullable<GetRoomsQuery["rooms"]>["data"][number];
type Table = NonNullable<Room>["tables"][number];

interface WaitersRoomsTabsProps {
  rooms: Room[];
  createOrderForTable: CreateOrderForTableAction;
}

function WaitersRoomsTabs({
  rooms,
  createOrderForTable,
}: WaitersRoomsTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [pendingTableId, setPendingTableId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const normalizedRooms = useMemo(() => rooms ?? [], [rooms]);

  const handleCreateOrder = (table: Table) => {
    if (!table?.id) return;

    const tableId = String(table.id);
    setError(null);
    setPendingTableId(tableId);

    startTransition(async () => {
      const result = await createOrderForTable(tableId);

      if (!result.success || !result.data?.orderId) {
        const message = result.success
          ? "Unable to retrieve the new order identifier."
          : result.error;
        setError(message);
      } else {
        router.push(`/waiters/table/${result.data.orderId}`);
      }

      setPendingTableId(null);
    });
  };

  if (!normalizedRooms || normalizedRooms.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500">No rooms available.</p>
      </div>
    );
  }

  return (
    <Tabs
      defaultValue="all"
      className="w-full"
      onValueChange={(value) => setActiveTab(value)}
    >
      <TabsList className="border-b border-khp-secondary bg-background sticky top-0 z-10">
        <TabsTrigger value="all">All Rooms</TabsTrigger>
        {normalizedRooms.map((room) => (
          <TabsTrigger key={room?.id} value={String(room?.id)}>
            {room?.name}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent
        value="all"
        className="w-full border border-khp-primary/20 rounded-md min-h-96 gap-y-2 flex flex-col p-4"
      >
        {normalizedRooms.map((room) => {
          if (!room || !room.tables || room.tables.length === 0) return null;
          const tables = room.tables;

          return (
            <div key={room.id} className="space-y-3">
              <h2 className="text-xl font-semibold">Tables in {room.name}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
                {tables.map((table) => {
                  if (!table) return null;
                  const hasOrder = table.orders && table.orders.length > 0;
                  const isTablePending =
                    pendingTableId === String(table.id) && isPending;

                  if (hasOrder) {
                    return (
                      <Link
                        key={table.id}
                        href={`/waiters/table/${table.orders?.[0].id}`}
                      >
                        <TableCard table={table} />
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={table.id}
                      type="button"
                      onClick={() => handleCreateOrder(table)}
                      disabled={isTablePending}
                      className="relative text-left"
                    >
                      <TableCard table={table} />
                      {isTablePending && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-md">
                          <Loader2 className="animate-spin text-khp-primary" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </TabsContent>

      {normalizedRooms.map((room) => {
        if (!room) return null;
        if (!room.tables || room.tables.length === 0) return null;
        const roomId = String(room.id);
        const showRoom = activeTab === "all" || activeTab === roomId;

        if (!showRoom) return null;

        return (
          <TabsContent
            key={roomId}
            value={roomId}
            className="w-full border border-khp-primary/20 rounded-md min-h-96 p-4 gap-y-2 flex flex-col"
          >
            <p className="text-lg font-semibold">Tables in {room.name}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
              {room.tables.map((table) => {
                if (!table) return null;
                const hasOrder = table.orders && table.orders.length > 0;
                const isTablePending =
                  pendingTableId === String(table.id) && isPending;

                if (hasOrder) {
                  return (
                    <Link
                      key={table.id}
                      href={`/waiters/table/${table.orders?.[0].id}`}
                    >
                      <TableCard table={table} />
                    </Link>
                  );
                }

                return (
                  <button
                    key={table.id}
                    type="button"
                    onClick={() => handleCreateOrder(table)}
                    disabled={isTablePending}
                    className="relative text-left"
                  >
                    <TableCard table={table} />
                    {isTablePending && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-md">
                        <Loader2 className="animate-spin text-khp-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </TabsContent>
        );
      })}

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          {error}
        </div>
      )}
    </Tabs>
  );
}

export default WaitersRoomsTabs;

