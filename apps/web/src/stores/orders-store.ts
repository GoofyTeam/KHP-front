import { create } from "zustand";

export interface OrdersFilters {
  roomIds: string[];
  tableIds: string[];
  statuses: string[];
}

interface OrdersStore {
  filters: OrdersFilters;
  setFilters: (filters: Partial<OrdersFilters>) => void;
  resetFilters: () => void;
}

const initialFilters: OrdersFilters = {
  roomIds: [],
  tableIds: [],
  statuses: [],
};

export const useOrdersStore = create<OrdersStore>((set) => ({
  filters: initialFilters,
  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
  resetFilters: () => set({ filters: initialFilters }),
}));
