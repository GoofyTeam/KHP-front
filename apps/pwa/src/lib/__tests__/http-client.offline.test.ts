import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const queueRequestMock = vi.fn();
const readQueuedRequestsMock = vi.fn();
const dropQueuedRequestMock = vi.fn();
const markRequestAsFailedMock = vi.fn();
const serializeRequestBodyMock = vi.fn();
const deserializeRequestBodyMock = vi.fn();

vi.mock("../offline-queue", () => ({
  queueRequest: queueRequestMock,
  readQueuedRequests: readQueuedRequestsMock,
  dropQueuedRequest: dropQueuedRequestMock,
  markRequestAsFailed: markRequestAsFailedMock,
  serializeRequestBody: serializeRequestBodyMock,
  deserializeRequestBody: deserializeRequestBodyMock,
}));

vi.mock("../offline-db", async () => {
  const actual = await vi.importActual<typeof import("../offline-db")>(
    "../offline-db"
  );
  return actual;
});

describe("ImprovedHttpClient offline behaviour", () => {
  let ImprovedHttpClient: typeof import("../http-client").ImprovedHttpClient;
  let fetchMock: ReturnType<typeof vi.fn>;

  const setNavigatorOnline = (value: boolean) => {
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      get: () => value,
    });
  };

  beforeEach(async () => {
    vi.resetModules();

    queueRequestMock.mockResolvedValue({ queued: true, id: "q1", queuedAt: 0 });
    readQueuedRequestsMock.mockResolvedValue([]);
    dropQueuedRequestMock.mockResolvedValue(undefined);
    markRequestAsFailedMock.mockResolvedValue(undefined);
    serializeRequestBodyMock.mockImplementation((body?: BodyInit | null) => ({
      kind: "string",
      value: typeof body === "string" ? body : JSON.stringify(body ?? {}),
    }));
    deserializeRequestBodyMock.mockImplementation(() => "queued-body");

    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    setNavigatorOnline(false);
    document.cookie = "XSRF-TOKEN=offline-token; path=/";

    ({ ImprovedHttpClient } = await import("../http-client"));

    vi.spyOn(window, "dispatchEvent");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.cookie = "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    queueRequestMock.mockReset();
    readQueuedRequestsMock.mockReset();
    dropQueuedRequestMock.mockReset();
    markRequestAsFailedMock.mockReset();
    serializeRequestBodyMock.mockReset();
    deserializeRequestBodyMock.mockReset();
  });

  it("queues mutations when the network is unavailable", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    const client = new ImprovedHttpClient({ baseUrl: "https://api.test" });

    const result = await client.post("/api/ingredients", { foo: "bar" });

    expect(result).toEqual({ queued: true });
    expect(queueRequestMock).toHaveBeenCalledTimes(1);
    expect(queueRequestMock).toHaveBeenCalledWith({
      baseUrl: "https://api.test",
      path: "/api/ingredients",
      method: "POST",
      headers: expect.objectContaining({
        "Content-Type": "application/json",
      }),
      body: "queued-body",
      requiresCsrf: true,
    });
    expect(window.dispatchEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: "khp:offline-queue" })
    );
  });

  it("replays queued requests when connectivity returns", async () => {
    setNavigatorOnline(true);

    const queuedRecord = {
      id: "queued-1",
      path: "/api/tasks",
      method: "POST",
      baseUrl: "https://api.test",
      headers: { "Content-Type": "application/json" },
      body: { kind: "string", value: "{\"foo\":\"bar\"}" },
      queuedAt: Date.now(),
      attempts: 0,
      requiresCsrf: true,
    } as const;

    readQueuedRequestsMock
      .mockResolvedValueOnce([queuedRecord])
      .mockResolvedValueOnce([]);
    deserializeRequestBodyMock.mockReturnValueOnce('{"foo":"bar"}');

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: { get: () => null, entries: () => [] },
    } as unknown as Response);

    const client = new ImprovedHttpClient({ baseUrl: "https://api.test" });

    await client.flushOfflineQueue();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(fetchMock).toHaveBeenCalledWith("https://api.test/api/tasks", {
      method: "POST",
      headers: expect.objectContaining({ "Content-Type": "application/json" }),
      body: '{"foo":"bar"}',
      credentials: "include",
    });
    expect(dropQueuedRequestMock).toHaveBeenCalledWith("queued-1");
    expect(markRequestAsFailedMock).not.toHaveBeenCalled();
  });
});
