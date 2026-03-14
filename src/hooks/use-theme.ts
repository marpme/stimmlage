import { useCallback, useEffect } from "react";

export const useTheme = () => {
  const isLight = true;
  const isDark = false;

  const applyLightTheme = useCallback(() => {
    localStorage.removeItem("theme");
    document.documentElement.classList.remove("dark");
    document.documentElement.classList.add("light");
  }, []);

  useEffect(() => {
    applyLightTheme();
  }, [applyLightTheme]);

  return { theme: "light" as const, isDark, isLight };
};
