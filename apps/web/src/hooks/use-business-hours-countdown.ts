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

      // Finding all today's business hours
      const todayHours = businessHours.filter(
        (bh) => bh.day_of_week === currentDay
      );

      if (!todayHours || todayHours.length === 0) {
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

      // Check all today's time slots
      let isCurrentlyOpen = false;
      let timeUntilNext: string | null = null;
      let nextEvent: "opens" | "closes" | null = null;
      let currentStatus = "";
      let activeSlot: BusinessHour | null = null;
      let nextSlot: BusinessHour | null = null;

      // Sort time slots by opening hour
      const sortedTodayHours = todayHours.sort((a, b) => {
        const aOpens = parseTime(a.opens_at);
        const bOpens = parseTime(b.opens_at);
        return aOpens - bOpens;
      });

      // Check if we are in an active slot
      for (const slot of sortedTodayHours) {
        const opensAt = parseTime(slot.opens_at);
        const closesAt = parseTime(slot.closes_at);

        if (slot.is_overnight) {
          // For overnight slots (closing next day)
          if (currentTime >= opensAt || currentTime < closesAt) {
            isCurrentlyOpen = true;
            activeSlot = slot;
            break;
          }
        } else {
          // For normal slots (same day)
          if (currentTime >= opensAt && currentTime < closesAt) {
            isCurrentlyOpen = true;
            activeSlot = slot;
            break;
          }
        }
      }

      if (isCurrentlyOpen && activeSlot) {
        // We are open, calculate time until closing
        const closesAt = parseTime(activeSlot.closes_at);

        if (activeSlot.is_overnight) {
          // Closing tomorrow
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(Math.floor(closesAt / 60), closesAt % 60, 0, 0);
          timeUntilNext = formatTimeDifference(
            tomorrow.getTime() - now.getTime()
          );
        } else {
          // Closing today
          const closingTime = new Date(now);
          closingTime.setHours(Math.floor(closesAt / 60), closesAt % 60, 0, 0);
          timeUntilNext = formatTimeDifference(
            closingTime.getTime() - now.getTime()
          );
        }

        nextEvent = "closes";
        currentStatus = "Open";
      } else {
        // We are closed, find the next opening slot
        for (const slot of sortedTodayHours) {
          const opensAt = parseTime(slot.opens_at);
          if (currentTime < opensAt) {
            nextSlot = slot;
            break;
          }
        }

        if (nextSlot) {
          // There is still a slot today
          const opensAt = parseTime(nextSlot.opens_at);
          const openingTime = new Date(now);
          openingTime.setHours(Math.floor(opensAt / 60), opensAt % 60, 0, 0);
          timeUntilNext = formatTimeDifference(
            openingTime.getTime() - now.getTime()
          );
          nextEvent = "opens";
          currentStatus = "Closed";
        } else {
          // No more slots today, look for the next day
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
              currentStatus: "Closed for today",
            });
            return;
          } else {
            setCountdown({
              isOpen: false,
              timeUntilNext: null,
              nextEvent: null,
              currentStatus: "No business hours configured",
            });
            return;
          }
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

function formatTimeDifference(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  const remainingMinutes = minutes % 60;
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
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
  const currentDay = now.getDay();
  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7;
  }

  const [hours, minutes] = targetTime.split(":").map(Number);
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + daysUntilTarget);
  targetDate.setHours(hours, minutes, 0, 0);

  return formatTimeDifference(targetDate.getTime() - now.getTime());
}
