import { create } from "zustand";
import type { GetProductQuery } from "@workspace/graphql";

// Utiliser les types GraphQL générés
type ProductData = NonNullable<GetProductQuery["ingredient"]>;

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
