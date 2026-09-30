import { useEffect, useRef, useState } from "react";
import { playSound } from "@/lib/audio";
import { useWindowFade } from "@/lib/menu/window-fade";
import { cornerTransitionMs } from "@/lib/motion";
import { readChoice, saveChoice } from "@/lib/saved-choice";
import {
  screens,
  activityInstruction,
  screenInstruction,
  screenHelp,
  type ActivityScreen,
} from "./activity.data";
import { preloadListens } from "./music/use-listens";

const screenStorageKey = "activity-screen";

export const useActivity = () => {
  // Reopen the screen the visitor last left on.
  const [activeScreen, setActiveScreen] = useState(() =>
    readChoice(screenStorageKey, screens, "GitHub"),
  );
  const activeScreenIndex = screens.indexOf(activeScreen);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const { fadeTo } = useWindowFade();
  const [pointedOption, setPointedOption] = useState(0);

  // Show help for the pointed option while the menu is open, else the screen's own instruction.
  const helpText = isMenuOpen
    ? screenHelp[screens[pointedOption]]
    : (screenInstruction[activeScreen] ?? activityInstruction);

  const headerRef = useRef<HTMLDivElement>(null);

  // Load recent listens and decode their covers once the browser is idle, before Music opens.
  useEffect(() => {
    const preload = () => void preloadListens();

    if ("requestIdleCallback" in window) {
      const idle = requestIdleCallback(preload, { timeout: 2000 });
      return () => cancelIdleCallback(idle);
    }

    const timer = setTimeout(preload, 0);
    return () => clearTimeout(timer);
  }, []);

  // Manage dismissal and delayed focus while the screen menu is open.
  useEffect(() => {
    if (!isMenuOpen) return;

    // Close the menu on an outside press or Escape.
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node))
        setMenuOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        playSound("select");
        setMenuOpen(false);
      }
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
        saveChoice(screenStorageKey, nextScreen);
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
