import { useEffect, useState, type KeyboardEvent } from "react";
import type { Listen } from "@/lib/integrations/listenbrainz";
import { RowHand } from "../../../pixel-hand";
import { Loopmaster } from "./loopmaster";
import { placeholderListens } from "./music.data";
import { formatDuration, formatPlayedAgo, signature } from "./music.utils";
import { useListens, type CoverState } from "./use-listens";
import { useLoopmaster } from "./use-loopmaster";

// Step focus between the stack's buttons with the up and down arrow keys.
// Unlike Choices, which steps from the hand (it follows hover), this steps from the focused row.
const moveFocus = (event: KeyboardEvent<HTMLOListElement>) => {
  if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;

  const buttons = [...event.currentTarget.querySelectorAll("button")];
  const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
  const step = event.key === "ArrowDown" ? 1 : -1;

  event.preventDefault();
  buttons[(index + step + buttons.length) % buttons.length]?.focus();
};

// The Music screen: the player plus the Recently Played stack, with stand-ins until listens load.
export const MusicActivity = () => {
  const { listens, covers, waitForCover } = useListens();
  const live = listens.length > 0;

  // Show stand-in discs until listens arrive; remount only when the listens change, so each set keeps its order for the visit.
  return (
    <MusicPlayer
      key={live ? signature(listens) : "placeholder"}
      id={live ? signature(listens) : "placeholder"}
      listens={live ? listens : placeholderListens}
      covers={live ? covers : placeholderListens.map(() => "missing")}
      waitForCover={waitForCover}
    />
  );
};

// One set of listens in the player; remounted when the listens change.
const MusicPlayer = ({
  id,
  listens,
  covers,
  waitForCover,
}: {
  id: string;
  listens: Listen[];
  covers: CoverState[];
  waitForCover: (index: number) => Promise<void>;
}) => {
  const {
    current,
    stack,
    playing,
    swapping,
    queued,
    play,
    togglePlaying,
    registerRow,
    parts,
  } = useLoopmaster({
    count: listens.length,
    id,
    waitForCover,
  });

  const listen = listens[current];

  // Refresh elapsed time while Music stays open.
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    // Clip the disc sideways; compensate for transparent SVG pixels so the open lid keeps the 18px frame inset.
    <div
      data-player-clip
      className="-mx-4.5 flex flex-col overflow-x-clip px-4.5 pt-[calc(var(--spacing)*9_-_1px)]"
    >
      {/* Center a fixed-width group and pin the player to its top, so neither the window width nor a long title moves the lid. */}
      <div className="mb-6 grid grid-cols-[auto_minmax(0,8rem)] items-start justify-center gap-6">
        <Loopmaster
          title={listen.track}
          album={listen.album}
          coverUrl={listen.coverUrl}
          cover={covers[current]}
          playing={playing}
          onToggle={togglePlaying}
          disabled={swapping}
          {...parts}
        />

        <div className="flex min-w-0 flex-col self-center font-heading">
          {/* Say when this disc was last played; a live or placeholder disc reads "Now Playing". */}
          <p className="mb-1.5 text-sm text-label">
            {!listen.playingNow && listen.listenedAt
              ? formatPlayedAgo(listen.listenedAt, now)
              : "Now Playing"}
          </p>

          {/* Announce the new song after a swap. */}
          <h3
            aria-live="polite"
            className="line-clamp-2 text-base font-semibold wrap-break-word"
          >
            {listen.track}
          </h3>

          <p className="line-clamp-2 text-sm wrap-break-word">
            {listen.artist}
          </p>

          {listen.album && (
            <p className="mt-1.5 line-clamp-2 text-sm wrap-break-word text-gold">
              {listen.album}
            </p>
          )}
        </div>
      </div>

      <h3 className="group-heading">Recently Played</h3>

      {/* Move the hand with the arrow keys, like an FF7 menu; Enter plays the song. */}
      <ol onKeyDown={moveFocus}>
        {stack.map((index) => {
          const { track, artist, durationMs } = listens[index];

          return (
            <li
              key={index}
              ref={registerRow(index)}
            >
              <button
                type="button"
                title="Play now"
                onClick={() => play(index)}
                className="group relative flex w-full cursor-pointer items-center gap-3 py-1.5 pl-6.5 text-left font-heading outline-none"
              >
                {/* The hand stays on a pick that is waiting for the current swap. */}
                <RowHand
                  show={queued === index}
                  bob
                  className="group-hover:visible group-focus-visible:visible"
                />

                <span className="flex min-w-0 grow flex-col">
                  {/* Title and length share the first line, like a CD tracklist. */}
                  <span className="flex min-w-0 items-baseline justify-between gap-3">
                    <span className="truncate text-base font-semibold">
                      {track}
                    </span>

                    <span className="shrink-0 text-sm">
                      {formatDuration(durationMs)}
                    </span>
                  </span>

                  <span className="truncate text-sm">{artist}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
