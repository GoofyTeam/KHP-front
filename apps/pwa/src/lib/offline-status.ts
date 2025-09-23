import { useOfflineStore } from "../stores/offline-store";
import { readQueuedRequests } from "./offline-queue";

let listenersInitialized = false;

export function initializeOfflineStatusListeners(baseUrl?: string): void {
  if (listenersInitialized || typeof window === "undefined") {
    return;
  }

  const resolvedBaseUrl = baseUrl || window.location.origin;

  const updateOnlineStatus = () => {
    useOfflineStore.getState().setOnline(navigator.onLine);
  };

  const handleQueueUpdate = (event: Event) => {
    const customEvent = event as CustomEvent<{
      count: number;
      timestamp?: number;
    }>;
    if (!customEvent.detail) return;
    const { count, timestamp } = customEvent.detail;
    useOfflineStore.getState().setQueuedCount(count, timestamp);
  };

  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
  window.addEventListener(
    "khp:offline-queue",
    handleQueueUpdate as EventListener
  );

  updateOnlineStatus();

  readQueuedRequests()
    .then((records) => {
      const count = records.filter(
        (record) => record.baseUrl === resolvedBaseUrl
      ).length;
      useOfflineStore
        .getState()
        .setQueuedCount(count, count === 0 ? Date.now() : undefined);
    })
    .catch((error) => {
      console.warn("Failed to hydrate offline queue state", error);
    });

  listenersInitialized = true;
}

