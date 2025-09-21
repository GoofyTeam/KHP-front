"use client";

import TableCard from "@/components/orders/table-card";
import { GetRoomsDocument } from "@/graphql/generated/graphql";
import { useQuery } from "@apollo/client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function WaitersPage() {
  const { data, loading } = useQuery(GetRoomsDocument, {
    fetchPolicy: "network-only",
  });
  const [activeTab, setActiveTab] = useState("all");

  const rooms = data?.rooms?.data ?? [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4 min-h-screen">
        <Loader2 className="animate-spin text-khp-primary" size={64} />
      </div>
    );
  }

  return (
    <div className="w-full py-4 px-2">
      <Tabs
        defaultValue="all"
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="border-b border-khp-secondary bg-background sticky top-0 z-10">
          <TabsTrigger value="all">All Rooms</TabsTrigger>
          {rooms.map((room) => (
            <TabsTrigger key={room.id} value={room.id}>
              {room.name}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent
          value="all"
          className="w-full border border-khp-primary/20 rounded-md min-h-96 gap-y-2 flex flex-col p-4"
        >
          {rooms.map((room) => {
            if (!room || !room.tables || room.tables.length === 0) return null;
            const tables = room.tables;

            return (
              <div key={room.id}>
                <h2 className="text-xl font-semibold mb-4">
                  Tables in {room.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
                  {tables.map((table) => {
                    if (!table) return null;

                    return (
                      <Link key={table.id} href={`/waiters/table/${table.id}`}>
                        <TableCard key={table.id} table={table} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </TabsContent>
        {rooms.map((room) => {
          if (!room) return null;
          if (activeTab !== "all" && activeTab !== room.id) return null;
          if (!room.tables || room.tables.length === 0) return null;
          const tables = room.tables;

          return (
            <TabsContent
              key={room.id}
              value={room.id}
              className="w-full border border-khp-primary/20 rounded-md min-h-96 p-4 gap-y-2 flex flex-col"
            >
              <p className="text-lg font-semibold">Tables in {room.name}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
                {tables.map((table) => {
                  if (!table) return null;

                  return (
                    <Link key={table.id} href={`/waiters/table/${table.id}`}>
                      <TableCard table={table} />
                    </Link>
                  );
                })}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

export default WaitersPage;
