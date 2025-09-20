"use client";

import { useMemo } from "react";

const createMinimalActions = () => ({
  recordToggle: () => {},
  recordOpenStart: () => {},
  recordOpenEnd: () => {},
  resetStats: () => {},
  resetSessionStats: () => {},
  getDailyStats: () => null,
  getWeeklyStats: () => [],
  cleanupOldData: () => {},
});

const createMinimalStats = () => ({
  totalToggles: 0,
  openCount: 0,
  closeCount: 0,
  totalOpenTime: 0,
  averageOpenDuration: 0,
  lastToggleTime: null,
  sessionToggles: 0,
  sessionStartTime: Date.now(),
  dailyStats: {},
  _cached: {
    openRatio: 0,
    averageDailyToggles: 0,
    lastCalculated: 0,
  },
});

const createMinimalFormattedStats = () => ({
  totalToggles: 0,
  openRatio: "0%",
  totalOpenTimeFormatted: "0ms",
  averageOpenDurationFormatted: "0ms",
  sessionToggles: 0,
  averageDailyToggles: 0,
  lastToggleTime: null,
});

const createMinimalTracking = () => ({
  isTracking: true,
  toggleTracking: () => {},
});

const createMinimalLiveStats = () => ({
  sessionToggles: 0,
  totalToggles: 0,
  isOpen: false,
  lastToggle: null,
});

// Hook simple qui retourne toujours les mêmes valeurs
const useStaticValue = <T>(factory: () => T): T => {
  return useMemo(() => factory(), [factory]);
};

// Hooks optimisés - retournent des valeurs statiques
export const useSidebarStats = () => useStaticValue(createMinimalStats);

export const useSidebarStatsActions = () =>
  useStaticValue(createMinimalActions);

export const useFormattedSidebarStats = () =>
  useStaticValue(createMinimalFormattedStats);

export const useSidebarStatsTracking = () =>
  useStaticValue(createMinimalTracking);

export const useLiveSidebarStats = () => useStaticValue(createMinimalLiveStats);
