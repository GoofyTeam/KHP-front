import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { ImprovedHttpClient } from "../http-client";

const clearCsrfCookie = () => {
  document.cookie =
    "XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
};

describe("ImprovedHttpClient", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    clearCsrfCookie();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    clearCsrfCookie();
  });

  it("initialises CSRF cookie when missing and sends JSON payloads with the token", async () => {
    const client = new ImprovedHttpClient({ baseUrl: "https://api.test" });

    fetchMock
      .mockImplementationOnce(async () => {
        document.cookie = "XSRF-TOKEN=token-from-server; path=/";
        return {
          ok: true,
          status: 204,
          statusText: "No Content",
          headers: {
            get: () => null,
            entries: () => [],
          },
        } as unknown as Response;
      })
      .mockImplementationOnce(async () => {
        return {
          ok: true,
          status: 200,
          statusText: "OK",
          headers: {
            get: (key: string) =>
              key.toLowerCase() === "content-type" ? "application/json" : null,
            entries: () => [["content-type", "application/json"]],
          },
          json: () => Promise.resolve({ success: true }),
        } as unknown as Response;
      });

    const result = await client.post("/secure", { hello: "world" });

    expect(result).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "https://api.test/sanctum/csrf-cookie",
    );

    const [, config] = fetchMock.mock.calls[1] ?? [];
    expect(config).toBeDefined();
    if (!config) throw new Error("Missing request configuration");

    const headers = config.headers as Record<string, string>;
    expect(headers["X-XSRF-TOKEN"]).toBe("token-from-server");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(config.body).toBe(JSON.stringify({ hello: "world" }));
  });

  it("caches GET responses when cache is enabled", async () => {
    document.cookie = "XSRF-TOKEN=cached-token; path=/";
    const client = new ImprovedHttpClient({ baseUrl: "https://api.test" });

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: {
        get: (key: string) =>
          key.toLowerCase() === "content-type" ? "application/json" : null,
        entries: () => [["content-type", "application/json"]],
      },
      json: () => Promise.resolve({ data: 42 }),
    } as unknown as Response);

    const first = await client.get<{ data: number }>("/data");
    const second = await client.get<{ data: number }>("/data");

    expect(first).toEqual({ data: 42 });
    expect(second).toEqual({ data: 42 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not force Content-Type when sending FormData", async () => {
    document.cookie = "XSRF-TOKEN=form-token; path=/";
    const client = new ImprovedHttpClient({ baseUrl: "https://api.test" });

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: {
        get: (key: string) =>
          key.toLowerCase() === "content-type" ? "application/json" : null,
        entries: () => [["content-type", "application/json"]],
      },
      json: () => Promise.resolve({ uploaded: true }),
    } as unknown as Response);

    const payload = new FormData();
    payload.append("file", "content");

    const response = await client.post<FormData, { uploaded: boolean }>(
      "/upload",
      payload,
    );

    expect(response).toEqual({ uploaded: true });

    const [, config] = fetchMock.mock.calls[0] ?? [];
    expect(config).toBeDefined();
    if (!config) throw new Error("Missing request configuration for upload");

    const headers = config.headers as Record<string, string>;
    expect(headers["Content-Type"]).toBeUndefined();
    expect(headers["X-XSRF-TOKEN"]).toBe("form-token");
    expect(config.body).toBe(payload);
  });

  it("handles CSRF token expiration with automatic retry", async () => {
    const client = new ImprovedHttpClient({ baseUrl: "https://api.test" });
    let callCount = 0;

    fetchMock.mockImplementation(async (url: string) => {
      callCount++;

      if (url.includes("/sanctum/csrf-cookie")) {
        document.cookie = "XSRF-TOKEN=fresh-token-" + callCount + "; path=/";
        return {
          ok: true,
          status: 204,
          statusText: "No Content",
          headers: { get: () => null, entries: () => [] },
        } as unknown as Response;
      }

      if (callCount === 1) {
        return {
          ok: false,
          status: 419,
          statusText: "CSRF Token Mismatch",
          headers: { get: () => null, entries: () => [] },
        } as unknown as Response;
      }

      return {
        ok: true,
        status: 200,
        statusText: "OK",
        headers: {
          get: (key: string) =>
            key === "content-type" ? "application/json" : null,
          entries: () => [["content-type", "application/json"]],
        },
        json: () => Promise.resolve({ success: true }),
      } as unknown as Response;
    });

    const result = await client.post("/api/test", { data: "test" });

    expect(result).toEqual({ success: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(callCount).toBe(2);
  });

  it("respects retry limits on CSRF failures", async () => {
    const client = new ImprovedHttpClient({
      baseUrl: "https://api.test",
      retries: 2,
    });
    let callCount = 0;

    fetchMock.mockImplementation(async (url: string) => {
      callCount++;

      if (url.includes("/sanctum/csrf-cookie")) {
        document.cookie = "XSRF-TOKEN=token-" + callCount + "; path=/";
        return {
          ok: true,
          status: 204,
          statusText: "No Content",
          headers: { get: () => null, entries: () => [] },
        } as unknown as Response;
      }

      return {
        ok: false,
        status: 419,
        statusText: "CSRF Token Mismatch",
        headers: { get: () => null, entries: () => [] },
      } as unknown as Response;
    });

    await expect(client.post("/api/test", { data: "test" })).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalled();
    expect(callCount).toBeGreaterThan(2);
  });

  it("does not request CSRF token for GET requests", async () => {
    const client = new ImprovedHttpClient({ baseUrl: "https://api.test" });

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: {
        get: (key: string) =>
          key === "content-type" ? "application/json" : null,
        entries: () => [["content-type", "application/json"]],
      },
      json: () => Promise.resolve({ data: "test" }),
    } as unknown as Response);

    await client.get("/api/data");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://api.test/api/data");
  });
});
