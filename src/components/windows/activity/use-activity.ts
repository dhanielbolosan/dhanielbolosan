import { useEffect, useRef, useState } from "react";
import { useWindowFade } from "@/lib/window-fade";
import { cornerTransitionMs } from "@/lib/motion";
import {
  screens,
  activityInstruction,
  screenHelp,
  type ActivityScreen,
} from "./activity.data";

export const useActivity = () => {
  const [activeScreen, setActiveScreen] = useState<ActivityScreen>("GitHub");

  const activeScreenIndex = screens.indexOf(activeScreen);

  const [isMenuOpen, setMenuOpen] = useState(false);

  const { fadeTo } = useWindowFade();

  const [pointedOption, setPointedOption] = useState(0);

  // Show help for the pointed option while the menu is open.
  const helpText = isMenuOpen
    ? screenHelp[screens[pointedOption]]
    : activityInstruction;

  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    // Close the menu on an outside press or Escape.
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node))
        setMenuOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    // Focus the current screen's choice after the corner menu finishes opening.
    const focusTimer = setTimeout(
      () =>
        headerRef.current
          ?.querySelectorAll<HTMLElement>("a, button")
          ?.[activeScreenIndex]?.focus(),
      cornerTransitionMs,
    );

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      clearTimeout(focusTimer);
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isMenuOpen, activeScreenIndex]);

  // Fade only when switching screens; selecting the current one just closes the menu.
  const selectScreen = (nextScreen: ActivityScreen) => {
    if (nextScreen === activeScreen) setMenuOpen(false);
    else
      fadeTo(() => {
        setActiveScreen(nextScreen);
        setMenuOpen(false);
      });
  };

  // Reopen with the pointer and help text on the current screen.
  const openMenu = () => {
    setPointedOption(activeScreenIndex);
    setMenuOpen(true);
  };

  return {
    activeScreen,
    activeScreenIndex,
    isMenuOpen,
    setPointedOption,
    helpText,
    headerRef,
    selectScreen,
    openMenu,
  };
};
