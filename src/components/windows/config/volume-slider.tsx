import { useSyncExternalStore } from "react";
import {
  getSoundSettings,
  subscribeSound,
  setSoundSettings,
  playSound,
  defaultSoundSettings,
} from "@/lib/audio";
import { RowHand } from "../../pixel-hand";
import type { ConfigState } from "./use-config";

export const VolumeSlider = ({
  label,
  config,
}: {
  label: string;
  config: ConfigState;
}) => {
  const { hoveredSetting, setHoveredSetting } = config;
  // Subscribe here so dragging volume does not rerender the color settings.
  const sound = useSyncExternalStore(
    subscribeSound,
    getSoundSettings,
    () => defaultSoundSettings,
  );

  return (
    <>
      {/* Use the same label size and pointer spacing as the other settings. */}
      <label
        htmlFor="sound-volume"
        className="relative py-0.5 pl-7 text-base"
      >
        <RowHand
          show={hoveredSetting === "volume"}
          bob
        />
        <span className="text-label">{label}</span>
      </label>
      <div className="relative ml-7 grid grid-cols-[6.25rem_auto] items-center gap-x-1 text-base @min-[21rem]:grid-cols-[11.25rem_auto]">
        {/* Match the swatch row width and move endpoint labels above cramped sliders. */}
        <span
          aria-hidden="true"
          className="absolute right-full mr-1 @max-[18rem]:right-auto @max-[18rem]:bottom-full @max-[18rem]:left-0 @max-[18rem]:mb-1 @max-[18rem]:mr-0"
        >
          Low
        </span>
        <input
          id="sound-volume"
          type="range"
          min={0}
          max={100}
          value={sound.volume}
          aria-label="Sound volume"
          aria-valuetext={sound.volume ? `${sound.volume}%` : "Muted"}
          onFocus={() => setHoveredSetting("volume")}
          onBlur={() => setHoveredSetting(undefined)}
          onChange={(event) =>
            setSoundSettings({ volume: Number(event.target.value) })
          }
          onPointerUp={() => playSound("select")}
          onKeyUp={(event) => {
            if (
              event.key.startsWith("Arrow") ||
              event.key === "Home" ||
              event.key === "End"
            )
              playSound("select");
          }}
          className="ff7-slider min-w-0"
        />
        <span
          aria-hidden="true"
          className="@max-[18rem]:absolute @max-[18rem]:bottom-full @max-[18rem]:left-25 @max-[18rem]:mb-1 @max-[18rem]:-translate-x-full"
        >
          High
        </span>
      </div>
    </>
  );
};
