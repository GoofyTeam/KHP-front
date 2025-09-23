"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { type DateRange } from "react-day-picker";

import { Button } from "@workspace/ui/components/button";
import { Calendar } from "@workspace/ui/components/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";

interface DatePickerFilterProps {
  onDateChange?: (dates: { startDate?: Date; endDate?: Date }) => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
}

export function DatePickerFilter({
  onDateChange,
  initialStartDate,
  initialEndDate,
}: DatePickerFilterProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    initialStartDate && initialEndDate
      ? { from: initialStartDate, to: initialEndDate }
      : initialStartDate
        ? { from: initialStartDate, to: undefined }
        : undefined
  );
  const [open, setOpen] = React.useState(false);

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDateRange(undefined);
    setOpen(false);
    onDateChange?.({ startDate: undefined, endDate: undefined });
  };

  const handleSelect = (selectedDate: DateRange | undefined) => {
    setDateRange(selectedDate);
    onDateChange?.({
      startDate: selectedDate?.from,
      endDate: selectedDate?.to,
    });
  };

  return (
    <div className="relative">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            data-empty={!dateRange?.from}
            className="data-[empty=true]:text-muted-foreground w-[240px] justify-start text-left font-normal pr-8"
          >
            <CalendarIcon />
            <div>
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                    {format(dateRange.to, "dd/MM/yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yyyy")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </div>
          </Button>
        </PopoverTrigger>
        {dateRange?.from && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 opacity-50 hover:opacity-100 z-10"
            type="button"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={handleSelect}
            className="rounded-lg border shadow-sm"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
