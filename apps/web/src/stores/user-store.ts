"use client";

import { create } from "zustand";
import { httpClient, type User as HttpUser } from "@/lib/httpClient";

// Utilisation du type httpClient User
type User = HttpUser;

type State = {
  user: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (u: User | null) => void;
  fetchUser: () => Promise<{ success: boolean; data?: User; error?: string }>;
  clearUser: () => void;
  clearError: () => void;
};

export const useUserStore = create<State>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,

  setUser: (user) => set({ user, error: null }),

  fetchUser: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await httpClient.get<{ user: User }>("/api/user");

      const userData = response?.user;

      if (!userData || !userData.id) {
        const errorMessage = "User not found";
        set({
          isLoading: false,
          error: errorMessage,
          user: null,
        });
        return { success: false, error: errorMessage };
      }

      set({
        user: userData,
        isLoading: false,
        error: null,
      });

      return { success: true, data: userData };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch user data";
      set({
        isLoading: false,
        error: errorMessage,
        user: null,
      });
      return { success: false, error: errorMessage };
    }
  },

  clearUser: () => set({ user: null, error: null }),

  clearError: () => set({ error: null }),
}));
