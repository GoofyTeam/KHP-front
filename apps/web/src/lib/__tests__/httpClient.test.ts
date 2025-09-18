import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";

describe("httpClient (browser environment)", () => {
  const originalApiUrl = process.env.NEXT_PUBLIC_API_URL;
  let httpClient: (typeof import("../httpClient"))["httpClient"];
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_API_URL = "https://api.test";
    fetchMock = vi.fn();

    // Complete window mock with location
    vi.stubGlobal("window", {
      location: { hostname: "localhost", href: "" },
    } as Window & typeof globalThis);

    vi.stubGlobal("document", { cookie: "" });
    vi.stubGlobal("fetch", fetchMock);
    ({ httpClient } = await import("../httpClient"));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetAllMocks();

    if (originalApiUrl === undefined) {
      delete process.env.NEXT_PUBLIC_API_URL;
    } else {
      process.env.NEXT_PUBLIC_API_URL = originalApiUrl;
    }
  });

  it("performs GET requests without requesting CSRF tokens", async () => {
    const responseBody = { value: 123 };

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: {
        get: (key: string) =>
          key.toLowerCase() === "content-type" ? "application/json" : null,
      },
      text: () => Promise.resolve(JSON.stringify(responseBody)),
    });

    const getCsrfSpy = vi.spyOn(
      httpClient as { getCsrfToken: () => Promise<string | null> },
      "getCsrfToken"
    );

    const data = await httpClient.get<typeof responseBody>("/test");

    expect(data).toEqual(responseBody);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/test",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
        headers: expect.objectContaining({
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        }),
        cache: "default",
      })
    );
    expect(getCsrfSpy).not.toHaveBeenCalled();

    getCsrfSpy.mockRestore();
  });

  it("attaches CSRF token and keeps FormData headers untouched on POST", async () => {
    (document as { cookie: string }).cookie = "XSRF-TOKEN=token123";

    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: {
        get: () => "application/json",
      },
      text: () => Promise.resolve(""),
    });

    const getCsrfSpy = vi.spyOn(
      httpClient as { getCsrfToken: () => Promise<string | null> },
      "getCsrfToken"
    );

    const payload = new FormData();
    payload.append("file", "value");

    await httpClient.post("/upload", payload);

    expect(getCsrfSpy).toHaveBeenCalledTimes(1);

    const [, config] = fetchMock.mock.calls.at(-1) ?? [];
    expect(config).toBeDefined();
    if (!config) throw new Error("Missing fetch configuration");

    expect(config.headers).not.toBeUndefined();
    expect((config.headers as Record<string, string>)["X-XSRF-TOKEN"]).toBe(
      "token123"
    );
    expect(
      (config.headers as Record<string, string>)["Content-Type"]
    ).toBeUndefined();
    expect(config.body).toBe(payload);

    getCsrfSpy.mockRestore();
  });

  it("unwraps validation errors from 422 responses", async () => {
    (document as { cookie: string }).cookie = "XSRF-TOKEN=token123";

    fetchMock.mockResolvedValue({
      ok: false,
      status: 422,
      statusText: "Unprocessable Entity",
      headers: {
        get: (key: string) =>
          key.toLowerCase() === "content-type"
            ? "application/json"
            : key.toLowerCase() === "content-length"
              ? "1"
              : null,
      },
      json: () => Promise.resolve({ errors: { email: ["Invalid address"] } }),
      text: () => Promise.resolve(""),
    });

    const getCsrfSpy = vi.spyOn(
      httpClient as { getCsrfToken: () => Promise<string | null> },
      "getCsrfToken"
    );

    await expect(httpClient.post("/users", { email: "bad" })).rejects.toThrow(
      "Invalid address"
    );
    expect(getCsrfSpy).toHaveBeenCalled();

    getCsrfSpy.mockRestore();
  });

  it("returns an empty object when response is not JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 204,
      statusText: "No Content",
      headers: {
        get: (key: string) =>
          key.toLowerCase() === "content-type"
            ? "text/plain"
            : key.toLowerCase() === "content-length"
              ? "0"
              : null,
      },
      text: () => Promise.resolve(""),
    });

    const result = await httpClient.get("/no-json");
    expect(result).toEqual({});
  });

  it("throws a friendly message for unauthorized responses", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
      headers: {
        get: (key: string) =>
          key.toLowerCase() === "content-type"
            ? "application/json"
            : key.toLowerCase() === "content-length"
              ? "0"
              : null,
      },
      text: () => Promise.resolve(""),
    });

    await expect(httpClient.get("/needs-auth")).rejects.toThrow(
      "Authentication required. Please log in."
    );
  });
});
