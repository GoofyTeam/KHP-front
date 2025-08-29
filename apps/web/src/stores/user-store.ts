import { create } from "zustand";
import {
  httpClient,
  type AuthResponse,
  type User as HttpUser,
} from "@/lib/httpClient";

type User = HttpUser;

type State = {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchUser: (force?: boolean) => Promise<void>;
  setUser: (u: User) => void;
};

export const useUserStore = create<State>((set, get) => ({
  user: null,
  loading: false,
  error: null,
  fetchUser: async (force = false) => {
    if (!force && (get().loading || get().user)) return;
    set({ loading: true, error: null });
    try {
      const res = await httpClient.get<AuthResponse>("/api/user");
      set({ user: res.user, loading: false });
    } catch (e) {
      set({ loading: false, error: e instanceof Error ? e.message : "Error" });
    }
  },
  setUser: (u) => set({ user: u }),
}));
