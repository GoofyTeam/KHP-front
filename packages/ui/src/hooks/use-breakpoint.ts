"use client";

import { useState, useEffect } from "react";
import { useDebounce } from "@uidotdev/usehooks";

type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
};

export function useBreakpoint(breakpoint: Breakpoint): boolean {
  // Initialiser avec une valeur par defaut desktop pour eviter hydration mismatch
  const [windowWidth, setWindowWidth] = useState(1024); // md breakpoint par défaut
  const [isInitialized, setIsInitialized] = useState(false);

  // Utiliser le debounce seulement après l'initialisation
  const debouncedWidth = useDebounce(windowWidth, isInitialized ? 100 : 0);

  useEffect(() => {
    const checkBreakpoint = () => {
      setWindowWidth(window.innerWidth);
      if (!isInitialized) {
        setIsInitialized(true);
      }
    };

    checkBreakpoint();
    window.addEventListener("resize", checkBreakpoint);
    return () => window.removeEventListener("resize", checkBreakpoint);
  }, [isInitialized]);

  return debouncedWidth >= breakpoints[breakpoint];
}
