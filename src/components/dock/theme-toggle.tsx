import { IconSun, IconMoon } from "@tabler/icons-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "../imports/tooltip";
import { useTheme } from "@/lib/theme-provider";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const isDark =
    theme === "dark" ||
    (theme === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return isDark ? (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconSun
          className="size-full"
          onClick={toggleTheme}
        />
      </TooltipTrigger>
      <TooltipContent>Toggle Theme</TooltipContent>
    </Tooltip>
  ) : (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconMoon
          className="size-full"
          onClick={toggleTheme}
        />
      </TooltipTrigger>
      <TooltipContent>Toggle Theme</TooltipContent>
    </Tooltip>
  );
};
