import { create } from "zustand";

interface ProductData {
  id: string;
  name: string;
  unit: string;
  image_url?: string | null;
  categories: Array<{ name: string }>;
  quantities?: Array<{
    quantity: number;
    location: {
      id: string;
      name: string;
      locationType?: {
        id: string;
        name: string;
        is_default: boolean;
      };
    };
  }>;
}

interface ProductStore {
  currentProduct: ProductData | null;
  setCurrentProduct: (product: ProductData | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export const useProduct = create<ProductStore>((set) => ({
  currentProduct: null,
  setCurrentProduct: (product) => set({ currentProduct: product }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
