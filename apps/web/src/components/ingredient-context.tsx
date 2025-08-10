"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface IngredientContextType {
  ingredientName: string | null;
  setIngredientName: (name: string | null) => void;
}

const IngredientContext = createContext<IngredientContextType | undefined>(
  undefined
);

export function IngredientProvider({ children }: { children: ReactNode }) {
  const [ingredientName, setIngredientName] = useState<string | null>(null);

  return (
    <IngredientContext.Provider value={{ ingredientName, setIngredientName }}>
      {children}
    </IngredientContext.Provider>
  );
}

export function useIngredient() {
  const context = useContext(IngredientContext);
  if (context === undefined) {
    throw new Error("useIngredient must be used within an IngredientProvider");
  }
  return context;
}
