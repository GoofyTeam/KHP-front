import { create } from "zustand";

type OfflineState = {
  isOnline: boolean;
  queuedCount: number;
  lastSyncedAt: number | null;
  setOnline: (isOnline: boolean) => void;
  setQueuedCount: (count: number, timestamp?: number) => void;
};

const initialOnlineState =
  typeof navigator !== "undefined" ? navigator.onLine : true;

export const useOfflineStore = create<OfflineState>((set) => ({
  isOnline: initialOnlineState,
  queuedCount: 0,
  lastSyncedAt: null,
  setOnline: (isOnline) => set({ isOnline }),
  setQueuedCount: (queuedCount, timestamp) =>
    set((state) => ({
      queuedCount,
      lastSyncedAt:
        queuedCount === 0 && timestamp ? timestamp : state.lastSyncedAt,
    })),
}));

