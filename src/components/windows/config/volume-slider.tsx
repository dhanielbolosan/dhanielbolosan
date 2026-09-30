import { useSyncExternalStore } from "react";
import {
  getSoundSettings,
  subscribeSound,
  setSoundSettings,
  playSound,
  defaultSoundSettings,
} from "@/lib/audio";
import { PixelHand } from "../../pixel-hand";
import type { ConfigState } from "./use-config";

export const VolumeSlider = ({ config }: { config: ConfigState }) => {
  const { setHoveredSetting, openSetting } = config;
  // Subscribe here so dragging volume does not rerender the color settings.
  const sound = useSyncExternalStore(
    subscribeSound,
    getSoundSettings,
    () => defaultSoundSettings,
  );

  return (
    <div className="relative ml-8 grid min-w-0 grid-cols-[minmax(0,6.25rem)_auto] items-center gap-x-1.5 text-base @min-[21rem]:grid-cols-[minmax(0,11.25rem)_auto]">
      <span
        aria-hidden="true"
        className="absolute right-full mr-1.5 @max-[18rem]:right-auto @max-[18rem]:bottom-full @max-[18rem]:left-0 @max-[18rem]:mb-1.5 @max-[18rem]:mr-0"
      >
        {openSetting === "volume" && (
          <PixelHand className="pointer-events-none absolute inset-y-0 right-full my-auto mr-1.5 motion-safe:animate-bob" />
        )}
        Low
      </span>

      <input
        id="sound-volume"
        type="range"
        data-sound="none"
        disabled={openSetting !== "volume"}
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
        className="ff7-slider min-w-0 disabled:pointer-events-none disabled:cursor-default"
      />

      <span
        aria-hidden="true"
        className="@max-[18rem]:absolute @max-[18rem]:bottom-full @max-[18rem]:left-25 @max-[18rem]:mb-1.5 @max-[18rem]:-translate-x-full"
      >
        High
      </span>
    </div>
  );
};
