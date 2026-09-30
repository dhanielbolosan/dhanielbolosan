import { useEffect, useRef, useState } from "react";
import { defaultSoundSettings, playSound, setSoundSettings } from "@/lib/audio";
import { fadeMs } from "@/lib/motion";
import { saveChoice } from "@/lib/saved-choice";
import {
  colorDefinitions,
  defaultColors,
  storageKey,
  type Setting,
  type ColorKey,
  type Rgb,
} from "./config.data";
import {
  getMutedCreditColor,
  getMutedCreditOutline,
  loadSavedColors,
  rgbToHex,
} from "./config.utils";

export const useConfig = () => {
  // Restore the saved palette once when Config mounts.
  const [colors, setColors] = useState(() =>
    loadSavedColors(storageKey, defaultColors),
  );

  const [hoveredSetting, setHoveredSetting] = useState<Setting>();
  const [openSetting, setOpenSetting] = useState<Setting>();
  const [selectedColorKey, setSelectedColorKey] = useState<ColorKey>();
  const [hoveredColorKey, setHoveredColorKey] = useState<ColorKey>();
  const [lastColorKeys, setLastColorKeys] = useState<
    Partial<Record<Setting, ColorKey>>
  >({
    window: "tl",
    text: "text",
  });
  const [activeChannelIndex, setActiveChannelIndex] = useState(0);

  // Return keyboard focus to the color opener, then its setting label.
  const settingButtonRef = useRef<HTMLButtonElement>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);

  // Apply and persist palette changes, including adaptive credit colors.
  useEffect(() => {
    // Apply color changes immediately through the shared CSS variables.
    for (const definition of colorDefinitions)
      document.documentElement.style.setProperty(
        definition.cssVar,
        rgbToHex(colors[definition.key]),
      );

    // Keep muted text and its outline readable over every window corner.
    const mutedCredit = getMutedCreditColor(colors.br);
    document.documentElement.style.setProperty("--muted-credit", mutedCredit);
    document.documentElement.style.setProperty(
      "--muted-credit-outline",
      getMutedCreditOutline(mutedCredit),
    );

    // Blocked storage keeps the palette for this visit only.
    const saveColors = () => saveChoice(storageKey, JSON.stringify(colors));

    // Save after dragging settles, and flush before a refresh or navigation.
    const saveTimer = setTimeout(saveColors, fadeMs);
    window.addEventListener("pagehide", saveColors);

    return () => {
      clearTimeout(saveTimer);
      window.removeEventListener("pagehide", saveColors);
    };
  }, [colors]);

  // Update one channel without mutating the existing palette.
  const setChannelValue = (
    key: ColorKey,
    channelIndex: number,
    value: number,
  ) =>
    setColors((current) => {
      const next = [...current[key]] as Rgb;
      next[channelIndex] = value;

      return { ...current, [key]: next };
    });

  // Close the setting and clear its selected color.
  const closeSetting = () => {
    setOpenSetting(undefined);
    setSelectedColorKey(undefined);
  };

  // Close the sliders first, then the setting on the next Back action.
  const stepBack = () => {
    if (selectedColorKey) setSelectedColorKey(undefined);
    else closeSetting();
  };

  // Listen for Escape while a setting is open and restore focus on close.
  useEffect(() => {
    if (!openSetting) return;

    // Escape follows the same two-step path as Back.
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as Element;
      // Include the portalled sliders, and leave other menus alone.
      if (
        event.key === "Escape" &&
        !event.defaultPrevented &&
        (target === document.body ||
          target.closest(`[data-setting="${openSetting}"], [role="dialog"]`))
      ) {
        event.preventDefault();
        playSound("select");
        if (selectedColorKey) setSelectedColorKey(undefined);
        else {
          settingButtonRef.current?.focus();
          setOpenSetting(undefined);
          setSelectedColorKey(undefined);
        }
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [openSetting, selectedColorKey]);

  // Close an expanded setting on outside presses after its sliders close.
  useEffect(() => {
    // Dismiss outside clicks only when the sliders are closed.
    if (!openSetting || selectedColorKey) return;

    const onPointerDown = (event: PointerEvent) => {
      if (
        !(event.target as Element).closest(`[data-setting="${openSetting}"]`)
      ) {
        setOpenSetting(undefined);
        setSelectedColorKey(undefined);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);

    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openSetting, selectedColorKey]);

  // Hover takes priority over the open setting for the header hint.
  const pointedSetting = hoveredSetting ?? openSetting;

  // Toggle the chosen setting, or restore the default palette and volume.
  const selectSetting = (setting: Setting) => {
    if (setting === "reset") {
      setColors(defaultColors);
      setSoundSettings(defaultSoundSettings);
      closeSetting();
    } else if (openSetting === setting) closeSetting();
    else {
      setSelectedColorKey(undefined);
      setOpenSetting(setting);
    }
  };

  // Open the color's sliders and remember it for the setting's next visit.
  const selectColor = (key: ColorKey, button: HTMLButtonElement) => {
    colorButtonRef.current = button;
    setSelectedColorKey(key);
    if (openSetting)
      setLastColorKeys((current) => ({ ...current, [openSetting]: key }));
  };

  return {
    colors,
    hoveredSetting,
    setHoveredSetting,
    openSetting,
    selectedColorKey,
    hoveredColorKey,
    setHoveredColorKey,
    lastColorKeys,
    activeChannelIndex,
    settingButtonRef,
    colorButtonRef,
    setActiveChannelIndex,
    setChannelValue,
    stepBack,
    selectSetting,
    selectColor,
    pointedSetting,
  };
};

export type ConfigState = ReturnType<typeof useConfig>;
