import type { RestaurantCardBusinessHour } from "@/queries/restaurant-card-query";

export const DAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

export function getNormalizedDay(date: Date): number {
  const day = date.getDay();
  return day === 0 ? 7 : day;
}

function buildDateWithTime(base: Date, time: string, dayOffset: number) {
  const [hours, minutes, seconds] = time
    .split(":")
    .map((value) => Number.parseInt(value ?? "0", 10));

  return new Date(
    base.getFullYear(),
    base.getMonth(),
    base.getDate() + dayOffset,
    Number.isNaN(hours) ? 0 : hours,
    Number.isNaN(minutes) ? 0 : minutes,
    Number.isNaN(seconds) ? 0 : seconds,
    0
  );
}

function getSlotWindow(
  slot: RestaurantCardBusinessHour,
  now: Date,
  openDayOffset: number
) {
  const open = buildDateWithTime(now, slot.opens_at, openDayOffset);
  let close = buildDateWithTime(now, slot.closes_at, openDayOffset);

  if (slot.is_overnight || close <= open) {
    close = buildDateWithTime(now, slot.closes_at, openDayOffset + 1);
  }

  return { open, close };
}

export interface BusinessWindow {
  slot: RestaurantCardBusinessHour;
  open: Date;
  close: Date;
}

export interface BusinessHoursStatus {
  isOpen: boolean;
  currentWindow?: BusinessWindow;
  nextWindow?: BusinessWindow;
  timeUntilCloseMs?: number;
  timeUntilOpenMs?: number;
}

function collectBusinessWindows(
  businessHours: RestaurantCardBusinessHour[],
  now: Date
): BusinessWindow[] {
  const windows: BusinessWindow[] = [];

  for (let dayOffset = -1; dayOffset <= 7; dayOffset += 1) {
    const targetDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + dayOffset
    );
    const normalizedDay = getNormalizedDay(targetDate);

    businessHours.forEach((slot) => {
      if (slot.day_of_week !== normalizedDay) {
        return;
      }

      const window = getSlotWindow(slot, now, dayOffset);
      windows.push({ slot, ...window });
    });
  }

  return windows.sort((a, b) => a.open.getTime() - b.open.getTime());
}

export function getBusinessHoursStatus(
  businessHours: RestaurantCardBusinessHour[] | null | undefined,
  now: Date = new Date()
): BusinessHoursStatus {
  if (!businessHours?.length) {
    return { isOpen: false };
  }

  const windows = collectBusinessWindows(businessHours, now);

  const currentWindow = windows.find(
    (window) => now >= window.open && now <= window.close
  );

  if (currentWindow) {
    const timeUntilCloseMs = currentWindow.close.getTime() - now.getTime();
    const nextWindow = windows.find((window) => window.open > currentWindow.close);

    return {
      isOpen: true,
      currentWindow,
      nextWindow,
      timeUntilCloseMs,
    };
  }

  const nextWindow = windows.find((window) => window.open > now);

  return {
    isOpen: false,
    nextWindow,
    timeUntilOpenMs: nextWindow
      ? nextWindow.open.getTime() - now.getTime()
      : undefined,
  };
}

export function formatTime(value: string) {
  return value?.slice(0, 5) || "--";
}

export function formatTimeRange(slot: RestaurantCardBusinessHour) {
  return `${formatTime(slot.opens_at)} - ${formatTime(slot.closes_at)}`;
}

export function formatBusinessHours(
  businessHours: RestaurantCardBusinessHour[] | null | undefined
) {
  if (!businessHours?.length) {
    return [];
  }

  const sorted = [...businessHours].sort((a, b) => {
    if (a.day_of_week !== b.day_of_week) {
      return a.day_of_week - b.day_of_week;
    }

    if (a.sequence !== b.sequence) {
      return a.sequence - b.sequence;
    }

    return a.opens_at.localeCompare(b.opens_at);
  });

  const grouped = new Map<number, string[]>();

  sorted.forEach((slot) => {
    const existing = grouped.get(slot.day_of_week) ?? [];
    grouped.set(slot.day_of_week, [...existing, formatTimeRange(slot)]);
  });

  return Array.from({ length: 7 }, (_, index) => {
    const dayNumber = index + 1;
    const ranges = grouped.get(dayNumber) ?? [];

    return {
      dayNumber,
      dayLabel: DAY_LABELS[dayNumber],
      ranges,
    };
  });
}

export function formatDuration(milliseconds: number | undefined) {
  if (!milliseconds || milliseconds <= 0) {
    return null;
  }

  const totalMinutes = Math.floor(milliseconds / 60000);

  if (totalMinutes <= 0) {
    return null;
  }

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  const pad = (value: number) => value.toString().padStart(2, "0");

  if (days >= 1) {
    return `${days}J ${pad(hours)}H ${pad(minutes)}M`;
  }

  if (hours >= 1) {
    return `${pad(hours)}H ${pad(minutes)}M`;
  }

  return `${pad(minutes)}M`;
}

