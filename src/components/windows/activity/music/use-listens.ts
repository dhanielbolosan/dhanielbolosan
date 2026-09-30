import { useEffect, useState } from "react";
import {
  fetchRecentListens,
  type Listen,
} from "@/lib/integrations/listenbrainz";
import { coverWaitMs } from "@/lib/motion";
import { signature } from "./music.utils";

export type CoverState = "loading" | "ready" | "missing";

type LoadedListens = {
  listens: Listen[];
  covers: CoverState[];
  decoded: Promise<void>[];
  images: HTMLImageElement[];
  loadedAt: number;
};

// Reuse a load for a minute, matching the function's edge cache, so Now Playing stays current.
const freshMs = 60_000;

// Share one load at a time, so covers are decoded before Music is even opened.
let loaded: LoadedListens | undefined;
let loading: Promise<LoadedListens | undefined> | undefined;

// Fetch the listens and decode every cover; a failed or stale load lets the next call fetch again.
export const preloadListens = () => {
  if (loaded && Date.now() - loaded.loadedAt > freshMs) loading = undefined;

  return (loading ??= fetchRecentListens()
    .then((listens) => {
      if (!listens?.length) throw new Error("No listens");

      // Nothing changed: keep the decoded covers and just mark the load fresh again.
      if (loaded && signature(listens) === signature(loaded.listens)) {
        loaded = { ...loaded, listens, loadedAt: Date.now() };
        return loaded;
      }

      // Load the marker font now, so a blank CD-R never flashes a fallback font.
      if (listens.some((listen) => !listen.coverUrl))
        void document.fonts.load('12px "Permanent Marker"');

      const images: HTMLImageElement[] = [];
      const covers = listens.map<CoverState>((listen) =>
        listen.coverUrl ? "loading" : "missing",
      );

      // Keep each decoded image referenced so the browser holds it ready to paint.
      const decoded = listens.map((listen, index) => {
        if (!listen.coverUrl) return Promise.resolve();

        const image = new Image();
        image.src = listen.coverUrl;
        images.push(image);

        return image.decode().then(
          () => void (covers[index] = "ready"),
          () => void (covers[index] = "missing"),
        );
      });

      loaded = { listens, covers, decoded, images, loadedAt: Date.now() };

      return loaded;
    })
    .catch(() => {
      loading = undefined;
      return undefined;
    }));
};

// Load recent listens and track each cover's decode state.
export const useListens = () => {
  // Start from whatever the page-level preload already has.
  const [listens, setListens] = useState(() => loaded?.listens ?? []);
  const [covers, setCovers] = useState(() => [...(loaded?.covers ?? [])]);

  useEffect(() => {
    let active = true;

    // Pick up the preload (refetched if over a minute old), then refresh each cover's state as it settles.
    void preloadListens().then((result) => {
      if (!active || !result) return;

      setListens(result.listens);
      setCovers([...result.covers]);

      for (const decode of result.decoded)
        void decode.then(() => active && setCovers([...result.covers]));
    });

    // Ignore late results once the screen unmounts.
    return () => {
      active = false;
    };
  }, []);

  // Wait for a cover to decode, giving a slow network a bounded head start.
  const waitForCover = (index: number) =>
    Promise.race([
      loaded?.decoded[index] ?? Promise.resolve(),
      new Promise<void>((resolve) => setTimeout(resolve, coverWaitMs)),
    ]);

  return { listens, covers, waitForCover };
};
