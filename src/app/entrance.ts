import {
  columnStaggerMs,
  windowStaggerMs,
  windowEntryMs,
  entranceBufferMs,
} from "../lib/motion";

// Combine column and window offsets to stagger the entrances.
export const getEntryDelay = (columnIndex: number, windowIndex: number) =>
  columnIndex * columnStaggerMs + windowIndex * windowStaggerMs;

// Find when the last visible window finishes entering, including its delay.
export const getEntranceDuration = (
  columns: { windows: unknown[] }[],
  visibleColumnIndices: number[],
) => {
  const lastEntryDelay = Math.max(
    0,
    ...visibleColumnIndices.flatMap((columnIndex) =>
      columns[columnIndex].windows.map((_, windowIndex) =>
        getEntryDelay(columnIndex, windowIndex),
      ),
    ),
  );

  // Keep interaction and dialogue paused until the last visible window settles.
  return windowEntryMs + lastEntryDelay + entranceBufferMs;
};
