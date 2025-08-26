import { create } from "zustand";

export interface FilterState {
  search: string;
  categoryIds: string[];
}

interface StocksStore {
  // State
  filters: FilterState;
  isRegisterLostMode: boolean;

  // Actions
  setFilters: (filters: FilterState) => void;
  setIsRegisterLostMode: (mode: boolean) => void;
  updateSearch: (search: string) => void;
  updateCategoryIds: (categoryIds: string[]) => void;
  resetFilters: () => void;
  toggleRegisterLostMode: () => void;
}

const initialFilters: FilterState = {
  search: "",
  categoryIds: [],
};

export const useStocksStore = create<StocksStore>((set) => ({
  // Initial state
  filters: initialFilters,
  isRegisterLostMode: false,

  // Actions
  setFilters: (filters) => set({ filters: { ...filters } }),

  setIsRegisterLostMode: (mode) => set({ isRegisterLostMode: mode }),

  updateSearch: (search) =>
    set((state) => ({
      filters: { ...state.filters, search },
    })),

  updateCategoryIds: (categoryIds) =>
    set((state) => ({
      filters: { ...state.filters, categoryIds },
    })),

  resetFilters: () => set({ filters: { ...initialFilters } }),

  toggleRegisterLostMode: () =>
    set((state) => ({
      isRegisterLostMode: !state.isRegisterLostMode,
    })),
}));

// Selectors optimisés pour éviter les re-renders inutiles
export const useFilters = () => useStocksStore((state) => state.filters);
export const useSearch = () => useStocksStore((state) => state.filters.search);
export const useCategoryIds = () =>
  useStocksStore((state) => state.filters.categoryIds);
export const useIsRegisterLostMode = () =>
  useStocksStore((state) => state.isRegisterLostMode);

// Actions selectors
export const useStocksActions = () =>
  useStocksStore((state) => ({
    setFilters: state.setFilters,
    setIsRegisterLostMode: state.setIsRegisterLostMode,
    updateSearch: state.updateSearch,
    updateCategoryIds: state.updateCategoryIds,
    resetFilters: state.resetFilters,
    toggleRegisterLostMode: state.toggleRegisterLostMode,
  }));
