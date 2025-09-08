import { create } from "zustand";
import type { User as HttpUser } from "@/lib/httpClient";

type User = HttpUser;

type State = {
  user: User | null;
  setUser: (u: User | null) => void;
};

export const useUserStore = create<State>((set) => ({
  user: null,
  setUser: (u) => set({ user: u }),
}));
