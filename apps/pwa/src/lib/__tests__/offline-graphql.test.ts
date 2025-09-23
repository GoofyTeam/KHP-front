import { beforeEach, describe, expect, it, vi } from "vitest";

const graphqlRequestMock = vi.fn();
const cacheGraphQLResponseMock = vi.fn();
const getCachedGraphQLResponseMock = vi.fn();

vi.mock("../graph-client", () => ({
  graphqlRequest: graphqlRequestMock,
}));

vi.mock("../offline-cache", () => ({
  cacheGraphQLResponse: cacheGraphQLResponseMock,
  getCachedGraphQLResponse: getCachedGraphQLResponseMock,
}));

describe("graphqlRequestWithOffline", () => {
  beforeEach(() => {
    vi.resetModules();
    graphqlRequestMock.mockReset();
    cacheGraphQLResponseMock.mockReset();
    getCachedGraphQLResponseMock.mockReset();
  });

  it("caches successful network responses", async () => {
    const payload = { foo: "bar" };
    graphqlRequestMock.mockResolvedValue(payload);
    cacheGraphQLResponseMock.mockResolvedValue({
      value: payload,
      timestamp: 111,
    });

    const { graphqlRequestWithOffline } = await import("../offline-graphql");

    const result = await graphqlRequestWithOffline("DocumentNode", { id: 1 });

    expect(result).toMatchObject({
      data: payload,
      source: "network",
    });
    expect(graphqlRequestMock).toHaveBeenCalledWith("DocumentNode", { id: 1 }, undefined);
    expect(cacheGraphQLResponseMock).toHaveBeenCalledWith(
      "DocumentNode",
      { id: 1 },
      payload
    );
  });

  it("returns cached data when the network request fails", async () => {
    const cached = { value: { foo: "cached" }, timestamp: 222 };
    graphqlRequestMock.mockRejectedValue(new Error("Network down"));
    getCachedGraphQLResponseMock.mockResolvedValue(cached);

    const { graphqlRequestWithOffline } = await import("../offline-graphql");

    const result = await graphqlRequestWithOffline("DocumentNode", { id: 42 });

    expect(result).toMatchObject({
      data: cached.value,
      source: "cache",
      timestamp: 222,
      error: expect.any(Error),
    });
    expect(cacheGraphQLResponseMock).not.toHaveBeenCalled();
  });
});

