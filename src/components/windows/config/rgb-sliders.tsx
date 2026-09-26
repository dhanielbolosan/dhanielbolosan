import { PixelHand } from "../../pixel-hand";
import { cn } from "@/lib/utils";
import { channels, getColorLabel, type ColorKey } from "./config.data";
import type { ConfigState } from "./use-config";

export const RgbSliders = ({
  colorKey,
  config,
}: {
  colorKey: ColorKey;
  config: ConfigState;
}) => {
  const { colors, activeChannelIndex, setActiveChannelIndex, setChannelValue } =
    config;

  return channels.map((channel, channelIndex) => (
    <label
      key={channel.name}
      onMouseEnter={() => setActiveChannelIndex(channelIndex)}
      className="relative grid grid-cols-[1rem_2.25rem_1fr] items-center gap-2 text-sm"
    >
      {channelIndex === activeChannelIndex && (
        <PixelHand className="absolute inset-y-0 right-full my-auto mr-2 motion-safe:animate-bob" />
      )}

      <span className={cn("font-semibold", channel.className)}>
        {channel.name}
      </span>

      <span className="text-right tabular-nums">
        {String(colors[colorKey][channelIndex]).padStart(3, "0")}
      </span>

      <input
        type="range"
        min={0}
        max={255}
        value={colors[colorKey][channelIndex]}
        onFocus={() => setActiveChannelIndex(channelIndex)}
        onChange={(event) =>
          setChannelValue(colorKey, channelIndex, Number(event.target.value))
        }
        aria-label={`${channel.name} for the ${getColorLabel(colorKey)} color`}
        className="ff7-slider"
      />
    </label>
  ));
};
