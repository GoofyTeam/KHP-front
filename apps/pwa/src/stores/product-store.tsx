import { create } from "zustand";
import { GetProductQuery } from "../graphql/getProduct.gql";

// Utiliser les types GraphQL générés
type ProductData = NonNullable<GetProductQuery["ingredient"]>;

interface ProductStore {
  currentProduct: ProductData | null;
  setCurrentProduct: (product: ProductData | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  applyLocalDelta: (productId: string, locationId: string | null, delta: number) => void;
}

export const useProduct = create<ProductStore>((set) => ({
  currentProduct: null,
  setCurrentProduct: (product) => set({ currentProduct: product }),
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  applyLocalDelta: (productId, locationId, delta) =>
    set((state) => {
      const p = state.currentProduct;
      if (!p || p.id !== productId) return {};
      const updated = { ...p };
      const q = [...(updated.quantities || [])];
      if (locationId) {
        const idx = q.findIndex((x) => x.location.id === locationId);
        if (idx >= 0) {
          q[idx] = { ...q[idx], quantity: (q[idx].quantity || 0) + delta } as any;
        }
      } else {
        // apply to total via first quantity as a fallback if no location; noop otherwise
        if (q.length > 0) q[0] = { ...q[0], quantity: (q[0].quantity || 0) + delta } as any;
      }
      (updated as any).quantities = q;
      return { currentProduct: updated };
    }),
}));
