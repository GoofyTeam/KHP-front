import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const readQueuedRequestsMock = vi.fn();

const setNavigatorOnline = (value: boolean) => {
  Object.defineProperty(window.navigator, "onLine", {
    configurable: true,
    get: () => value,
  });
};

describe("initializeOfflineStatusListeners", () => {
  beforeEach(() => {
    vi.resetModules();
    readQueuedRequestsMock.mockReset();
    vi.doMock("../offline-queue", () => ({
      readQueuedRequests: readQueuedRequestsMock,
    }));
    setNavigatorOnline(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("hydrates the offline store and reacts to queue events", async () => {
    readQueuedRequestsMock.mockResolvedValue([
      {
        id: "queued-1",
        baseUrl: "https://api.test",
        method: "POST",
        path: "/api/demo",
        queuedAt: Date.now(),
        attempts: 0,
      },
    ]);

    const { initializeOfflineStatusListeners } = await import("../offline-status");
    const { useOfflineStore } = await import("../../stores/offline-store");

    useOfflineStore.setState({ isOnline: true, queuedCount: 0, lastSyncedAt: null });

    initializeOfflineStatusListeners("https://api.test");
    await Promise.resolve();

    expect(useOfflineStore.getState().queuedCount).toBe(1);

    window.dispatchEvent(
      new CustomEvent("khp:offline-queue", {
        detail: { count: 0, timestamp: 1234567890 },
      })
    );

    expect(useOfflineStore.getState()).toMatchObject({
      queuedCount: 0,
      lastSyncedAt: 1234567890,
    });

    setNavigatorOnline(false);
    window.dispatchEvent(new Event("offline"));

    expect(useOfflineStore.getState().isOnline).toBe(false);
  });
});

