"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useDebounce } from "@uidotdev/usehooks";

import { MultiSelect } from "@workspace/ui/components/multi-select";
import { useOrdersStore } from "@/stores/orders-store";

interface Room {
  id: string;
  name: string;
}

interface Table {
  id: string;
  label: string;
  room: Room;
}

interface OrdersFiltersProps {
  rooms: Room[];
  tables: Table[];
}

const statusOptions = [
  { label: "En attente", value: "PENDING" },
  { label: "Servi", value: "SERVED" },
  { label: "Payé", value: "PAYED" },
  { label: "Annulé", value: "CANCELED" },
];

export default function OrdersFilters({ rooms, tables }: OrdersFiltersProps) {
  const { setFilters, filters } = useOrdersStore();

  const [roomFilters, setRoomFilters] = useState<string[]>(
    filters.roomIds || []
  );
  const [tableFilters, setTableFilters] = useState<string[]>(
    filters.tableIds || []
  );
  const [statusFilters, setStatusFilters] = useState<string[]>(
    filters.statuses || []
  );

  const debouncedRooms = useDebounce(roomFilters, 100);
  const debouncedTables = useDebounce(tableFilters, 100);
  const debouncedStatuses = useDebounce(statusFilters, 100);

  const roomOptions = useMemo(() => {
    return rooms
      .map((room) => ({
        label: room.name,
        value: room.id.toString(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [rooms]);

  // Filter tables based on selected rooms
  const filteredTables = useMemo(() => {
    if (roomFilters.length === 0) return tables;
    return tables.filter((table) =>
      roomFilters.includes(table.room.id.toString())
    );
  }, [tables, roomFilters]);

  const tableOptions = useMemo(() => {
    return filteredTables
      .map((table) => ({
        label: `${table.label} (${table.room.name})`,
        value: table.id.toString(),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [filteredTables]);

  const handleRoomsChange = useCallback(
    (rooms: string[]) => {
      setRoomFilters(rooms);
      // Reset table filters when room changes
      if (rooms.length > 0) {
        const validTables = tableFilters.filter((tableId) =>
          tables.some(
            (table) =>
              table.id.toString() === tableId &&
              rooms.includes(table.room.id.toString())
          )
        );
        if (validTables.length !== tableFilters.length) {
          setTableFilters(validTables);
        }
      }
    },
    [tableFilters, tables]
  );

  const handleTablesChange = useCallback((tables: string[]) => {
    setTableFilters(tables);
  }, []);

  const handleStatusesChange = useCallback((statuses: string[]) => {
    setStatusFilters(statuses);
  }, []);

  useEffect(() => {
    setFilters({
      roomIds: debouncedRooms,
      tableIds: debouncedTables,
      statuses: debouncedStatuses,
    });
  }, [debouncedRooms, debouncedTables, debouncedStatuses, setFilters]);

  return (
    <div className="flex items-center justify-between space-x-2 mb-4">
      <div className="flex flex-col-reverse md:flex-row w-full items-center gap-2">
        <div className="flex w-full md:w-auto items-center space-x-2">
          <MultiSelect
            options={statusOptions}
            onValueChange={handleStatusesChange}
            value={statusFilters}
            placeholder="Filtrer par statut"
            variant="default"
            className="w-full md:w-auto min-w-[180px]"
          />
          <MultiSelect
            options={roomOptions}
            onValueChange={handleRoomsChange}
            value={roomFilters}
            placeholder="Filtrer par salle"
            variant="default"
            className="w-full md:w-auto min-w-[180px]"
          />
          <MultiSelect
            options={tableOptions}
            onValueChange={handleTablesChange}
            value={tableFilters}
            placeholder="Filtrer par table"
            variant="default"
            className="w-full md:w-auto min-w-[180px]"
            disabled={roomFilters.length === 0}
          />
        </div>
      </div>
    </div>
  );
}
