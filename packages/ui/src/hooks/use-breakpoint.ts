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
  const [windowWidth, setWindowWidth] = useState(0);
  const debouncedWidth = useDebounce(windowWidth, 100);

  useEffect(() => {
    const checkBreakpoint = () => {
      setWindowWidth(window.innerWidth);
    };

    checkBreakpoint();
    window.addEventListener("resize", checkBreakpoint);
    return () => window.removeEventListener("resize", checkBreakpoint);
  }, []);

  return debouncedWidth >= breakpoints[breakpoint];
}
