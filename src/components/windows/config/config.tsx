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
    settingButtonRef,
    colorButtonRef,
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
        {settings.map(({ id, label }) => (
          <li
            key={id}
            data-setting={id}
            data-sound="select"
            onMouseEnter={() => setHoveredSetting(id)}
            onMouseLeave={() => setHoveredSetting(undefined)}
            onClick={(event) => {
              const target = event.target as Element;

              // Leave nested controls to handle their own clicks.
              if (
                !event.currentTarget.contains(target) ||
                target.closest('[role="radio"], input[type="range"]')
              )
                return;

              selectSetting(id);
            }}
            className={cn(
              "col-span-2 grid min-h-9 cursor-pointer grid-cols-subgrid items-center",
              id === "volume" && "@max-[18rem]:mt-6",
            )}
          >
            <button
              ref={openSetting === id ? settingButtonRef : undefined}
              type="button"
              aria-expanded={id === "reset" ? undefined : openSetting === id}
              aria-controls={id === "volume" ? "sound-volume" : undefined}
              onFocus={() => setHoveredSetting(id)}
              onBlur={() => setHoveredSetting(undefined)}
              className={cn(
                "group relative cursor-pointer py-0.5 pl-7 text-left text-base outline-none",
                id === "reset" && "col-span-2",
              )}
            >
              <RowHand
                show={hoveredSetting === id || openSetting === id}
                bob={hoveredSetting === id && openSetting !== id}
                className="group-focus-visible:visible"
              />
              <span className="text-label">{label}</span>
            </button>

            {id === "volume" && <VolumeSlider config={config} />}
            {id !== "reset" && id !== "volume" && (
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
                    onCloseAutoFocus={(event) => {
                      event.preventDefault();
                      // Restore a removed slider's focus without overriding an outside control.
                      if (document.activeElement === document.body)
                        colorButtonRef.current?.focus();
                    }}
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
        ))}
      </ul>

      <footer className="muted-credit mt-auto pt-3 text-right font-heading text-xs leading-relaxed">
        <span className="inline-block">
          <span className="text-[10px]">☻</span> dab /
        </span>{" "}
        <span className="inline-block">inspired by FINAL FANTASY VII</span>
      </footer>
    </section>
  );
};
