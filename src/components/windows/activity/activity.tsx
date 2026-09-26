import { Choices } from "../../choices";
import { CornerBox } from "../../corner-box";
import { PixelHand } from "../../pixel-hand";
import { Faded, WindowHeader } from "../../window";
import { GithubActivity } from "./github-activity";
import { screens } from "./activity.data";
import { useActivity } from "./use-activity";

export const Activity = () => {
  const {
    activeScreen,
    activeScreenIndex,
    isMenuOpen,
    setPointedOption,
    helpText,
    headerRef,
    selectScreen,
    openMenu,
  } = useActivity();

  return (
    <section className="flex grow flex-col gap-3">
      <WindowHeader
        ref={headerRef}
        help={helpText}
      >
        <CornerBox
          view={isMenuOpen}
          id={isMenuOpen ? "menu" : "title"}
          className="window-corner"
          render={(open) =>
            open ? (
              <>
                <h2 className="sr-only">Activity</h2>

                <Choices
                  boxed
                  initialChoiceIndex={activeScreenIndex}
                  onPoint={setPointedOption}
                  items={screens.map((label) => ({
                    label,
                    onSelect: () => selectScreen(label),
                  }))}
                />
              </>
            ) : (
              <h2>
                <button
                  type="button"
                  aria-haspopup="menu"
                  onClick={openMenu}
                  className="group relative cursor-pointer outline-none"
                >
                  <PixelHand className="invisible absolute inset-y-0 right-full my-auto mr-2 group-hover:visible group-focus-visible:visible motion-safe:animate-bob" />
                  Activity
                </button>
              </h2>
            )
          }
        />
      </WindowHeader>

      <Faded className="flex flex-1 flex-col gap-3">
        {activeScreen === "GitHub" && <GithubActivity />}

        {activeScreen !== "GitHub" && (
          <p className="flex min-h-64 flex-1 items-center justify-center text-center font-heading text-base">
            WIP :)
          </p>
        )}
      </Faded>
    </section>
  );
};
