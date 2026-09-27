import { Popover } from "radix-ui";
import { cn } from "@/lib/utils";
import { RowHand } from "../../pixel-hand";
import { WindowHeader } from "../../window";
import { settings, settingHelp } from "./config.data";
import { useConfig } from "./use-config";
import { ColorPreview } from "./color-preview";
import { RgbSliders } from "./rgb-sliders";
import { VolumeSlider } from "./volume-slider";

export const Config = () => {
  const config = useConfig();
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

      {/* Settings share label and preview columns; Reset remains the final row. */}
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
              <VolumeSlider
                label={label}
                config={config}
              />
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

      {/* Keep the credit muted and readable as the window palette changes. */}
      <footer className="muted-credit mt-auto pt-3 text-right font-heading text-xs leading-relaxed">
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
