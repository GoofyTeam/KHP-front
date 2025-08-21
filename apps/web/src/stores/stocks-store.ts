import React from "react";

interface FilterState {
  search: string;
  categoryIds: string[];
}

interface StocksStore {
  filters: FilterState;
  isRegisterLostMode: boolean;
  subscribers: Set<() => void>;
}

class StocksStoreClass {
  private state: StocksStore = {
    filters: {
      search: "",
      categoryIds: [],
    },
    isRegisterLostMode: false,
    subscribers: new Set(),
  };

  subscribe(callback: () => void) {
    this.state.subscribers.add(callback);
    return () => {
      this.state.subscribers.delete(callback);
    };
  }

  private notify() {
    this.state.subscribers.forEach((callback) => callback());
  }

  getState() {
    return this.state;
  }

  setFilters(filters: FilterState) {
    this.state = {
      ...this.state,
      filters: { ...filters },
    };
    this.notify();
  }

  setIsRegisterLostMode(mode: boolean) {
    this.state = {
      ...this.state,
      isRegisterLostMode: mode,
    };
    this.notify();
  }
}

export const stocksStore = new StocksStoreClass();

export const useStocksStore = () => {
  const [state, setState] = React.useState(stocksStore.getState());

  React.useEffect(() => {
    const unsubscribe = stocksStore.subscribe(() => {
      const newState = stocksStore.getState();
      setState(newState);
    });
    return unsubscribe;
  }, []);

  const setFilters = React.useCallback((filters: FilterState) => {
    stocksStore.setFilters(filters);
  }, []);

  const setIsRegisterLostMode = React.useCallback((mode: boolean) => {
    stocksStore.setIsRegisterLostMode(mode);
  }, []);

  return {
    filters: state.filters,
    isRegisterLostMode: state.isRegisterLostMode,
    setFilters,
    setIsRegisterLostMode,
  };
};
