import { useEffect, useState } from "react";
import {
  colorDefinitions,
  defaultColors,
  storageKey,
  type Setting,
  type ColorKey,
  type Rgb,
} from "./config.data";
import { loadSavedColors, rgbToHex } from "./config.utils";

export const useConfig = () => {
  // Restore the saved palette once when Config mounts.
  const [colors, setColors] = useState(() =>
    loadSavedColors(storageKey, defaultColors),
  );
  const [hoveredSetting, setHoveredSetting] = useState<Setting>();
  const [openSetting, setOpenSetting] = useState<Setting>();
  const [selectedColorKey, setSelectedColorKey] = useState<ColorKey>();
  const [hoveredColorKey, setHoveredColorKey] = useState<ColorKey>();
  const [lastColorKeys, setLastColorKeys] = useState<Record<string, ColorKey>>({
    window: "tl",
    text: "text",
  });
  const [activeChannelIndex, setActiveChannelIndex] = useState(0);

  useEffect(() => {
    // Apply color changes immediately through the shared CSS variables.
    for (const definition of colorDefinitions)
      document.documentElement.style.setProperty(
        definition.cssVar,
        rgbToHex(colors[definition.key]),
      );

    const saveColors = () => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(colors));
      } catch {
        // Keep customization usable when storage is unavailable.
      }
    };

    // Save after dragging settles, and flush before a refresh or navigation.
    const saveTimer = window.setTimeout(saveColors, 150);
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

  useEffect(() => {
    if (!openSetting) return;

    // Escape follows the same two-step path as Back.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (selectedColorKey) setSelectedColorKey(undefined);
        else {
          setOpenSetting(undefined);
          setSelectedColorKey(undefined);
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openSetting, selectedColorKey]);

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

  // Toggle the chosen setting, or restore the default palette for Reset.
  const selectSetting = (setting: Setting) => {
    if (setting === "reset") {
      setColors(defaultColors);
      closeSetting();
    } else if (openSetting === setting) closeSetting();
    else {
      setSelectedColorKey(undefined);
      setOpenSetting(setting);
    }
  };

  // Open the color's sliders and remember it for the setting's next visit.
  const selectColor = (key: ColorKey) => {
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
    setActiveChannelIndex,
    setChannelValue,
    stepBack,
    selectSetting,
    selectColor,
    pointedSetting,
  };
};

export type ConfigState = ReturnType<typeof useConfig>;
