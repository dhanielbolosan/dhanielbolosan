import { listenbrainzUsername } from "./site";

export interface Listen {
  track: string;
  artist: string;
  album: string;
  durationMs: number | null;
  coverUrl: string | null;
  listenedAt: number | null;
  playingNow: boolean;
}

// Fetch through the server endpoint so repeat visits hit the edge cache.
export const fetchRecentListens = async (signal?: AbortSignal) => {
  const params = new URLSearchParams({ username: listenbrainzUsername });
  const response = await fetch(`/api/recent-listens?${params}`, { signal });

  // Return no data on an HTTP failure so the caller keeps its current state.
  if (!response.ok) return;

  const result = (await response.json()) as { listens?: Listen[] };

  return result.listens;
};
