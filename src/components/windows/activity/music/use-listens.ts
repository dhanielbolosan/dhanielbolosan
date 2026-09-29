import { useEffect, useState } from "react";
import { fetchRecentListens, type Listen } from "@/lib/listenbrainz";
import { coverWaitMs } from "@/lib/motion";

export type CoverState = "loading" | "ready" | "missing";

interface LoadedListens {
  listens: Listen[];
  covers: CoverState[];
  decoded: Promise<void>[];
  images: HTMLImageElement[];
}

// Share one load per page, so covers are decoded before Music is even opened.
let loaded: LoadedListens | undefined;
let loading: Promise<LoadedListens | undefined> | undefined;

// Fetch the listens and decode every cover; a failed fetch lets the next call retry.
export const preloadListens = () =>
  (loading ??= fetchRecentListens()
    .then((listens) => {
      if (!listens?.length) throw new Error("No listens");

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

      loaded = { listens, covers, decoded, images };

      return loaded;
    })
    .catch(() => {
      loading = undefined;
      return undefined;
    }));

export const useListens = () => {
  // Start from whatever the page-level preload already has.
  const [listens, setListens] = useState(() => loaded?.listens ?? []);
  const [covers, setCovers] = useState(() => [...(loaded?.covers ?? [])]);

  useEffect(() => {
    let active = true;

    // Pick up the preload, then refresh each cover's state as it settles.
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
