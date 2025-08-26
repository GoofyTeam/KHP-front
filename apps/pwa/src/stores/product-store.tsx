import React, { createContext, useContext, useState } from "react";

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

interface ProductStoreContext {
  currentProduct: ProductData | null;
  setCurrentProduct: (product: ProductData | null) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ProductContext = createContext<ProductStoreContext | undefined>(
  undefined
);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [currentProduct, setCurrentProduct] = useState<ProductData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const value = {
    currentProduct,
    setCurrentProduct,
    isLoading,
    setIsLoading,
  };

  return (
    <ProductContext.Provider value={value}>{children}</ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
}
