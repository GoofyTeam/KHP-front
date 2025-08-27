import { create } from "zustand";
import { GetIngredientQuery } from "../graphql/getProduct.gql";

// Utiliser les types GraphQL générés
type ProductData = NonNullable<GetIngredientQuery["ingredient"]>;

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
