import type { Ref } from "react";
import { cn } from "@/lib/utils";
import barcode from "@/assets/loopmaster/barcode.svg";
import body from "@/assets/loopmaster/body.svg";
import floor from "@/assets/loopmaster/floor.svg";
import hinge from "@/assets/loopmaster/hinge.svg";
import lid from "@/assets/loopmaster/lid.svg";
import mechanism from "@/assets/loopmaster/mechanism.svg";
import switchKnob from "@/assets/loopmaster/switch-knob.svg";
import switchTrack from "@/assets/loopmaster/switch-track.svg";
import type { CoverState } from "./use-listens";

// Every part is drawn on the same canvas, so each layer fills the player box.
const layer =
  "pointer-events-none absolute -top-1.25 -left-1.25 h-41.25 w-40 max-w-none select-none";

export const Loopmaster = ({
  title,
  album,
  coverUrl,
  cover,
  playing,
  onToggle,
  disabled,
  knobRef,
  discRef,
  faceRef,
  lidRef,
  className,
}: {
  title: string;
  album: string;
  coverUrl: string | null;
  cover: CoverState;
  playing: boolean;
  onToggle: () => void;
  disabled: boolean;
  knobRef: Ref<HTMLImageElement>;
  discRef: Ref<HTMLSpanElement>;
  faceRef: Ref<HTMLSpanElement>;
  lidRef: Ref<HTMLSpanElement>;
  className?: string;
}) => (
  <button
    type="button"
    aria-label={playing ? "Pause" : "Play"}
    aria-pressed={playing}
    aria-disabled={disabled}
    onClick={onToggle}
    className={cn(
      "relative h-38.75 w-37.5 shrink-0 cursor-pointer aria-disabled:cursor-default rounded-[2.5rem] [perspective:800px] outline-none focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-label",
      className,
    )}
  >
    <img
      src={body}
      alt=""
      className={layer}
    />
    <img
      src={floor}
      alt=""
      className={layer}
    />
    <img
      src={mechanism}
      alt=""
      className={layer}
    />
    <img
      src={barcode}
      alt=""
      className={layer}
    />
    <img
      src={switchTrack}
      alt=""
      className={layer}
    />
    <img
      ref={knobRef}
      src={switchKnob}
      alt=""
      className={layer}
    />

    {/* The disc spins on its face; the swap slides the disc itself, so the two never fight. */}
    <span
      ref={discRef}
      className="absolute top-3 left-2.25 size-33 rounded-full after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:bg-linear-135 after:from-white/20 after:via-transparent after:to-black/15"
    >
      <span
        ref={faceRef}
        className="cd-face absolute inset-0 overflow-hidden rounded-full"
      >
        {cover === "ready" && coverUrl ? (
          <img
            src={coverUrl}
            alt=""
            decoding="sync"
            className="cd-art absolute inset-0 size-full object-cover"
          />
        ) : (
          // A burned CD-R: blank while the cover loads, the title and album in marker when there is none.
          <span className="cd-art absolute inset-0">
            {cover === "missing" && (
              <span className="absolute inset-x-[17%] top-[6%] flex h-[26%] items-center justify-center text-center">
                <b className="line-clamp-2 font-marker text-[12px] leading-[1.1] font-normal wrap-anywhere text-[#1d2233] opacity-90 [text-shadow:none]">
                  {title}
                </b>
              </span>
            )}

            {/* One line; a long album is cut off at the edge with no ellipsis. */}
            {cover === "missing" && album && (
              <span className="absolute inset-x-[22%] bottom-[12%] overflow-hidden text-center font-marker text-[10px] leading-[1.2] whitespace-nowrap text-[#1d2233] opacity-80 [text-shadow:none]">
                {album}
              </span>
            )}
          </span>
        )}
      </span>
    </span>

    {/* The lid and its hinge tab pivot where the tab meets the body's top edge. */}
    <span
      ref={lidRef}
      className="absolute inset-0 z-10 origin-[50%_2px]"
    >
      <span className="lid-haze absolute top-3 left-2.25 size-33 rounded-full" />
      <img
        src={lid}
        alt=""
        className={layer}
      />
      <img
        src={hinge}
        alt=""
        className={layer}
      />
    </span>
  </button>
);
