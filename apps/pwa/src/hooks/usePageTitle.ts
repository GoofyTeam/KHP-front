import { useEffect, useState } from "react";

// Store global simple pour le titre
let currentTitle = "";
const titleListeners = new Set<() => void>();

export function usePageTitle(title: string) {
  useEffect(() => {
    currentTitle = title;
    titleListeners.forEach((listener) => listener());

    return () => {
      currentTitle = "";
      titleListeners.forEach((listener) => listener());
    };
  }, [title]);
}

export function useCurrentTitle() {
  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    const listener = () => setTitle(currentTitle);
    titleListeners.add(listener);

    // Set initial value
    setTitle(currentTitle);

    return () => titleListeners.delete(listener);
  }, []);

  return title;
}
