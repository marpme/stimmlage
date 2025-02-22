import { FC, useMemo } from "react";

import { useTheme } from "@/hooks/use-theme";
import { SunFilledIcon, MoonFilledIcon } from "@/components/icons";
import { Button } from "@heroui/button";

export const ThemeSwitch: FC = () => {
  const { theme, toggleTheme } = useTheme();

  const isSelected = useMemo(() => theme === "light", [theme]);

  return (
    <Button
      isIconOnly
      aria-label={isSelected ? "Switch to dark mode" : "Switch to light mode"}
      onPress={() => toggleTheme()}
    >
      {isSelected ? <MoonFilledIcon size={22} /> : <SunFilledIcon size={22} />}
    </Button>
  );
};
