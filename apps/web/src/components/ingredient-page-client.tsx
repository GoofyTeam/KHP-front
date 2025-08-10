"use client";

import { useEffect } from "react";
import { useIngredient } from "./ingredient-context";
import type { Ingredient } from "../types/stocks";

interface IngredientPageClientProps {
  ingredient: Ingredient;
  children: React.ReactNode;
}

export function IngredientPageClient({
  ingredient,
  children,
}: IngredientPageClientProps) {
  const { setIngredientName } = useIngredient();

  useEffect(() => {
    setIngredientName(ingredient.name);
    return () => setIngredientName(null);
  }, [ingredient.name, setIngredientName]);

  return <>{children}</>;
}
