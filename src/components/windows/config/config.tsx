import { useSyncExternalStore } from "react";
import { Popover } from "radix-ui";
import {
  getSoundSettings,
  subscribeSound,
  setSoundSettings,
  playSound,
  defaultSoundSettings,
} from "@/lib/audio";
import { cn } from "@/lib/utils";
import { RowHand } from "../../pixel-hand";
import { WindowHeader } from "../../window";
import { settings, settingHelp } from "./config.data";
import { useConfig } from "./use-config";
import { ColorPreview } from "./color-preview";
import { RgbSliders } from "./rgb-sliders";

export const Config = () => {
  const config = useConfig();
  const sound = useSyncExternalStore(
    subscribeSound,
    getSoundSettings,
    () => defaultSoundSettings,
  );
  const {
    hoveredSetting,
    setHoveredSetting,
    openSetting,
    selectedColorKey,
    stepBack,
    selectSetting,
    pointedSetting,
  } = config;

  return (
    <section className="flex grow flex-col gap-3">
      <WindowHeader
        title="Config"
        help={
          pointedSetting
            ? settingHelp[pointedSetting]
            : "Select option to customize site"
        }
      />

      <ul className="grid grid-cols-[auto_1fr] items-start gap-y-2 font-heading">
        {settings.map(({ id, label }) =>
          id === "volume" ? (
            <li
              key={id}
              data-setting={id}
              data-sound="none"
              onMouseEnter={() => setHoveredSetting(id)}
              onMouseLeave={() => setHoveredSetting(undefined)}
              className="col-span-2 grid min-h-9 grid-cols-subgrid items-center @max-[18rem]:mt-6"
            >
              <label
                htmlFor="sound-volume"
                className="relative py-0.5 pl-7 text-base"
              >
                <RowHand
                  show={hoveredSetting === id}
                  bob
                />
                <span className="text-label">{label}</span>
              </label>
              <div className="relative ml-7 grid grid-cols-[6.25rem_auto] items-center gap-x-1 text-base @min-[21rem]:grid-cols-[11.25rem_auto]">
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
                  onFocus={() => setHoveredSetting(id)}
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
            </li>
          ) : (
            <li
              key={id}
              data-setting={id}
              data-sound="select"
              onMouseEnter={() => setHoveredSetting(id)}
              onMouseLeave={() => setHoveredSetting(undefined)}
              onClick={(event) => {
                const target = event.target as Element;

                // Ignore color buttons and clicks bubbling from the slider portal.
                if (
                  !event.currentTarget.contains(target) ||
                  target.closest('[role="radio"]')
                )
                  return;

                selectSetting(id);
              }}
              className="col-span-2 grid min-h-9 cursor-pointer grid-cols-subgrid items-center"
            >
              <button
                type="button"
                aria-expanded={id === "reset" ? undefined : openSetting === id}
                onFocus={() => setHoveredSetting(id)}
                onBlur={() => setHoveredSetting(undefined)}
                className={cn(
                  "relative cursor-pointer py-0.5 pl-7 text-left text-base outline-none",
                  id === "reset" && "col-span-2",
                )}
              >
                <RowHand
                  show={hoveredSetting === id || openSetting === id}
                  bob={hoveredSetting === id && openSetting !== id}
                />

                <span className="text-label">{label}</span>
              </button>

              {id !== "reset" && (
                <Popover.Root
                  open={openSetting === id && selectedColorKey !== undefined}
                  onOpenChange={(next) => !next && stepBack()}
                >
                  <Popover.Anchor className="ml-7 flex flex-wrap items-center gap-x-7 gap-y-3 @min-[21rem]:gap-x-3">
                    <ColorPreview
                      id={id}
                      config={config}
                    />
                  </Popover.Anchor>

                  <Popover.Portal>
                    <Popover.Content
                      side="bottom"
                      align="start"
                      sideOffset={6}
                      collisionPadding={12}
                      onEscapeKeyDown={(event) => event.preventDefault()}
                      onInteractOutside={(event) =>
                        (event.target as Element).closest(
                          `[data-setting="${id}"]`,
                        ) && event.preventDefault()
                      }
                      aria-label={`${label} sliders`}
                      className="window z-50 flex w-72 max-w-[calc(100vw-24px)] flex-col gap-2 p-4 font-heading"
                    >
                      {openSetting === id && selectedColorKey && (
                        <RgbSliders
                          colorKey={selectedColorKey}
                          config={config}
                        />
                      )}
                    </Popover.Content>
                  </Popover.Portal>
                </Popover.Root>
              )}
            </li>
          ),
        )}
      </ul>

      {/* ponytail: use the bottom-right color; sample the rendered gradient if mixed palettes need exact contrast. */}
      <footer
        className="mt-auto pt-3 text-right font-heading text-xs leading-relaxed [text-shadow:none]"
        style={{ color: "var(--muted-credit)" }}
      >
        <span className="inline-block">still leveling up /</span>{" "}
        <span className="inline-block">
          inspired by{" "}
          <a
            href="https://finalfantasy.fandom.com/wiki/Menu_(Final_Fantasy_VII)"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 hover:decoration-2 focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-current"
          >
            FINAL FANTASY VII
          </a>
        </span>
      </footer>
    </section>
  );
};
