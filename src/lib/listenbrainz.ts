import type { Listen } from "../../functions/lib/listens";
import { listenbrainzUsername } from "./site";

// The function defines the shape; a type-only import keeps server code out of the bundle.
export type { Listen };

// Fetch through the server endpoint so repeat visits hit the edge cache.
export const fetchRecentListens = async (signal?: AbortSignal) => {
  const params = new URLSearchParams({ username: listenbrainzUsername });
  const response = await fetch(`/api/recent-listens?${params}`, { signal });

  // Return no data on an HTTP failure so the caller keeps its current state.
  if (!response.ok) return;

  const result = (await response.json()) as { listens?: Listen[] };

  return result.listens;
};
