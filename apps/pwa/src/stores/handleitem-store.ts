import { create } from "zustand";

interface HandleItemState {
  pageTitle: string;
  setPageTitle: (title: string) => void;
}

const useHandleItemStore = create<HandleItemState>((set) => ({
  pageTitle: "Manage your item",
  setPageTitle: (title: string) => set({ pageTitle: title }),
}));

export { useHandleItemStore };
