"use client";

import { useState, useEffect } from "react";

export interface BusinessHour {
  opens_at: string;
  closes_at: string;
  day_of_week: number;
  sequence: number;
  is_overnight: boolean;
}

export interface BusinessHoursCountdown {
  isOpen: boolean;
  timeUntilNext: string | null;
  nextEvent: "opens" | "closes" | null;
  currentStatus: string;
}

export function useBusinessHoursCountdown(
  businessHours: BusinessHour[] | undefined
): BusinessHoursCountdown {
  const [countdown, setCountdown] = useState<BusinessHoursCountdown>({
    isOpen: false,
    timeUntilNext: null,
    nextEvent: null,
    currentStatus: "Loading...",
  });

  useEffect(() => {
    if (!businessHours || businessHours.length === 0) {
      setCountdown({
        isOpen: false,
        timeUntilNext: null,
        nextEvent: null,
        currentStatus: "No business hours configured",
      });
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentTime = now.getHours() * 60 + now.getMinutes();

      const todayHours = businessHours.find(
        (bh) => bh.day_of_week === currentDay
      );

      if (!todayHours) {
        const nextOpenDay = findNextOpenDay(businessHours, currentDay);
        if (nextOpenDay) {
          const timeUntilNext = calculateTimeUntilNextEvent(
            now,
            nextOpenDay.day_of_week,
            nextOpenDay.opens_at
          );
          setCountdown({
            isOpen: false,
            timeUntilNext,
            nextEvent: "opens",
            currentStatus: "Closed today",
          });
        } else {
          setCountdown({
            isOpen: false,
            timeUntilNext: null,
            nextEvent: null,
            currentStatus: "No business hours configured",
          });
        }
        return;
      }

      const opensAt = parseTime(todayHours.opens_at);
      const closesAt = parseTime(todayHours.closes_at);

      let isCurrentlyOpen = false;
      let timeUntilNext: string | null = null;
      let nextEvent: "opens" | "closes" | null = null;
      let currentStatus = "";

      if (todayHours.is_overnight) {
        if (currentTime >= opensAt || currentTime < closesAt) {
          isCurrentlyOpen = true;
          if (currentTime >= opensAt) {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(Math.floor(closesAt / 60), closesAt % 60, 0, 0);
            timeUntilNext = formatTimeDifference(
              tomorrow.getTime() - now.getTime()
            );
          } else {
            const closingTime = new Date(now);
            closingTime.setHours(
              Math.floor(closesAt / 60),
              closesAt % 60,
              0,
              0
            );
            timeUntilNext = formatTimeDifference(
              closingTime.getTime() - now.getTime()
            );
          }
          nextEvent = "closes";
          currentStatus = "Open";
        } else {
          isCurrentlyOpen = false;
          const openingTime = new Date(now);
          openingTime.setHours(Math.floor(opensAt / 60), opensAt % 60, 0, 0);
          timeUntilNext = formatTimeDifference(
            openingTime.getTime() - now.getTime()
          );
          nextEvent = "opens";
          currentStatus = "Closed";
        }
      } else {
        if (currentTime >= opensAt && currentTime < closesAt) {
          isCurrentlyOpen = true;
          const closingTime = new Date(now);
          closingTime.setHours(Math.floor(closesAt / 60), closesAt % 60, 0, 0);
          timeUntilNext = formatTimeDifference(
            closingTime.getTime() - now.getTime()
          );
          nextEvent = "closes";
          currentStatus = "Open";
        } else if (currentTime < opensAt) {
          isCurrentlyOpen = false;
          const openingTime = new Date(now);
          openingTime.setHours(Math.floor(opensAt / 60), opensAt % 60, 0, 0);
          timeUntilNext = formatTimeDifference(
            openingTime.getTime() - now.getTime()
          );
          nextEvent = "opens";
          currentStatus = "Closed";
        } else {
          const nextOpenDay = findNextOpenDay(businessHours, currentDay);
          if (nextOpenDay) {
            timeUntilNext = calculateTimeUntilNextEvent(
              now,
              nextOpenDay.day_of_week,
              nextOpenDay.opens_at
            );
            nextEvent = "opens";
          }
          isCurrentlyOpen = false;
          currentStatus = "Closed";
        }
      }

      setCountdown({
        isOpen: isCurrentlyOpen,
        timeUntilNext,
        nextEvent,
        currentStatus,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [businessHours]);

  return countdown;
}

function parseTime(timeString: string): number {
  const [hours, minutes] = timeString.split(":").map(Number);
  return hours * 60 + minutes;
}

function findNextOpenDay(
  businessHours: BusinessHour[],
  currentDay: number
): BusinessHour | null {
  for (let i = 1; i <= 7; i++) {
    const nextDay = (currentDay + i) % 7;
    const nextDayHours = businessHours.find((bh) => bh.day_of_week === nextDay);
    if (nextDayHours) {
      return nextDayHours;
    }
  }
  return null;
}

function calculateTimeUntilNextEvent(
  now: Date,
  targetDay: number,
  targetTime: string
): string {
  const target = new Date(now);
  let daysUntilTarget = (targetDay - now.getDay() + 7) % 7;

  if (daysUntilTarget === 0) {
    daysUntilTarget = 7;
  }

  target.setDate(target.getDate() + daysUntilTarget);
  const [hours, minutes] = targetTime.split(":").map(Number);
  target.setHours(hours, minutes, 0, 0);

  return formatTimeDifference(target.getTime() - now.getTime());
}

function formatTimeDifference(diffMs: number): string {
  const totalSeconds = Math.floor(diffMs / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const seconds = totalSeconds % 60;

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours === 0) {
      return `${days}d`;
    }
    return `${days}d ${remainingHours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}
