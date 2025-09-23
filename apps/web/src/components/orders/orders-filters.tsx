"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useDebounce } from "@uidotdev/usehooks";

import { MultiSelect } from "@workspace/ui/components/multi-select";
import { DatePickerFilter } from "@workspace/ui/components/date-picker";
import type { GetOrdersQuery } from "@/graphql/generated/graphql";
import { OrderStatusEnum } from "@/graphql/generated/graphql";
import type { OrdersFilters } from "@/stores/orders-store";

type Room = { id: string; name: string };
type Table = NonNullable<GetOrdersQuery["orders"]["data"]>[number]["table"];

interface OrdersFiltersProps {
  rooms: Room[];
  tables: (Table & { room: Room })[];
  filters: OrdersFilters;
  onFiltersChange: (filters: Partial<OrdersFilters>) => void;
}

const getStatusLabel = (status: OrderStatusEnum): string => {
  switch (status) {
    case OrderStatusEnum.Pending:
      return "Pending";
    case OrderStatusEnum.Served:
      return "Served";
    case OrderStatusEnum.Payed:
      return "Paid";
    case OrderStatusEnum.Canceled:
      return "Canceled";
    default:
      return status;
  }
};

const statusOptions = Object.values(OrderStatusEnum).map((status) => ({
  label: getStatusLabel(status),
  value: status,
}));

export default function OrdersFilters({
  rooms,
  tables,
  filters,
  onFiltersChange,
}: OrdersFiltersProps) {
  const [roomFilters, setRoomFilters] = useState<string[]>(
    filters.roomIds || []
  );
  const [tableFilters, setTableFilters] = useState<string[]>(
    filters.tableIds || []
  );
  const [statusFilters, setStatusFilters] = useState<string[]>(
    filters.statuses || []
  );
  const [dateFilters, setDateFilters] = useState<{
    startDate?: Date;
    endDate?: Date;
  }>({
    startDate: filters.startDate,
    endDate: filters.endDate,
  });

  const debouncedRooms = useDebounce(roomFilters, 100);
  const debouncedTables = useDebounce(tableFilters, 100);
  const debouncedStatuses = useDebounce(statusFilters, 100);
  const debouncedDateFilters = useDebounce(dateFilters, 300);

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

  const handleDateChange = useCallback(
    (dates: { startDate?: Date; endDate?: Date }) => {
      setDateFilters(dates);
    },
    []
  );

  useEffect(() => {
    onFiltersChange({
      roomIds: debouncedRooms,
      tableIds: debouncedTables,
      statuses: debouncedStatuses,
      startDate: debouncedDateFilters.startDate,
      endDate: debouncedDateFilters.endDate,
    });
  }, [
    debouncedRooms,
    debouncedTables,
    debouncedStatuses,
    debouncedDateFilters,
    onFiltersChange,
  ]);

  return (
    <div className="flex items-center justify-between space-x-2 mb-4">
      <div className="flex flex-col-reverse md:flex-row w-full items-center gap-2">
        <div className="flex w-full md:w-auto items-center space-x-2 flex-wrap gap-2">
          <DatePickerFilter
            onDateChange={handleDateChange}
            initialStartDate={filters.startDate}
            initialEndDate={filters.endDate}
          />
          <MultiSelect
            options={statusOptions}
            onValueChange={handleStatusesChange}
            value={statusFilters}
            placeholder="Filter by status"
            variant="default"
            className="w-full md:w-auto min-w-[180px] [&_[data-selected=true]]:bg-khp-primary [&_[data-selected=true]]:text-white [&_button:hover]:border-khp-primary [&_button:focus]:border-khp-primary [&_button:focus]:ring-khp-primary/20"
          />
          <MultiSelect
            options={roomOptions}
            onValueChange={handleRoomsChange}
            value={roomFilters}
            placeholder="Filter by room"
            variant="default"
            className="w-full md:w-auto min-w-[180px] [&_[data-selected=true]]:bg-khp-primary [&_[data-selected=true]]:text-white [&_button:hover]:border-khp-primary [&_button:focus]:border-khp-primary [&_button:focus]:ring-khp-primary/20"
          />
          <MultiSelect
            options={tableOptions}
            onValueChange={handleTablesChange}
            value={tableFilters}
            placeholder="Filter by table"
            variant="default"
            className="w-full md:w-auto min-w-[180px] [&_[data-selected=true]]:bg-khp-primary [&_[data-selected=true]]:text-white [&_button:hover]:border-khp-primary [&_button:focus]:border-khp-primary [&_button:focus]:ring-khp-primary/20"
            disabled={roomFilters.length === 0}
          />
        </div>
      </div>
    </div>
  );
}
