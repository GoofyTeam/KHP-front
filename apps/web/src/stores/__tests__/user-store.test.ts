import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApolloClient } from "@apollo/client";

// Mock Apollo Client
const mockQuery = vi.fn();
const mockApolloClient = {
  query: mockQuery,
} as unknown as ApolloClient<unknown>;

import { useUserStore } from "../user-store";

const resetStore = () =>
  useUserStore.setState({
    user: null,
    isLoading: false,
    error: null,
  });

describe("useUserStore", () => {
  beforeEach(() => {
    resetStore();
    mockQuery.mockReset();
  });

  it("fetchUser stores returned user data", async () => {
    const userData = {
      id: "1",
      name: "Jane",
      email: "jane@example.com",
      company: null,
    };
    mockQuery.mockResolvedValue({ data: { me: userData } });

    const promise = useUserStore.getState().fetchUser(mockApolloClient);
    expect(useUserStore.getState().isLoading).toBe(true);

    const result = await promise;

    expect(result).toEqual({ success: true, data: userData });
    expect(useUserStore.getState()).toMatchObject({
      user: userData,
      isLoading: false,
      error: null,
    });
    expect(mockQuery).toHaveBeenCalledWith({
      query: expect.anything(),
      fetchPolicy: "network-only",
      errorPolicy: "all",
    });
  });

  it("flags missing users as an error", async () => {
    mockQuery.mockResolvedValue({ data: { me: null } });

    const result = await useUserStore.getState().fetchUser(mockApolloClient);

    expect(result).toEqual({ success: false, error: "User not found" });
    expect(useUserStore.getState()).toMatchObject({
      user: null,
      isLoading: false,
      error: "User not found",
    });
  });

  it("surfaces network failures and clears user state", async () => {
    mockQuery.mockRejectedValue(new Error("Network down"));

    const result = await useUserStore.getState().fetchUser(mockApolloClient);

    expect(result).toEqual({ success: false, error: "Network down" });
    expect(useUserStore.getState()).toMatchObject({
      user: null,
      isLoading: false,
      error: "Network down",
    });
  });

  it("clears user and error states via dedicated actions", () => {
    const user = {
      id: "1",
      name: "Jane",
      email: "jane@example.com",
      company: null,
    };

    useUserStore.setState({ user, error: "boom" });

    useUserStore.getState().clearUser();
    expect(useUserStore.getState()).toMatchObject({ user: null, error: null });

    useUserStore.setState({ error: "something went wrong" });
    useUserStore.getState().clearError();
    expect(useUserStore.getState().error).toBeNull();
  });
});
