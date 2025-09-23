import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/ApolloClient", () => ({
  query: vi.fn(),
}));

import { fetchLocations } from "../locations-query";
import { query } from "@/lib/ApolloClient";

const mockQuery = vi.mocked(query);

const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

describe("fetchLocations", () => {
  beforeEach(() => {
    mockQuery.mockReset();
    consoleErrorSpy.mockClear();
  });

  it("returns the locations array when available", async () => {
    const rows = [
      { id: "1", name: "Cuisine" },
      { id: "2", name: "Réserve" },
    ];

    mockQuery.mockResolvedValue({
      data: { locations: { data: rows } },
      error: null,
    });

    await expect(fetchLocations()).resolves.toEqual(rows);
    expect(mockQuery).toHaveBeenCalledWith({
      query: expect.anything(),
      variables: {},
    });
  });

  it("logs and returns empty array when GraphQL returns an error field", async () => {
    const gqlError = new Error("GraphQL failure");
    mockQuery.mockResolvedValue({ data: null, error: gqlError });

    await expect(fetchLocations()).resolves.toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalledWith("GraphQL error:", gqlError);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Error fetching locations:",
      gqlError,
    );
  });

  it("returns an empty array if the query fails", async () => {
    mockQuery.mockRejectedValue(new Error("Network down"));

    await expect(fetchLocations()).resolves.toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});

afterAll(() => {
  consoleErrorSpy.mockRestore();
});
