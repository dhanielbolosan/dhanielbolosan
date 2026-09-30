import type { Listen } from "@/lib/integrations/listenbrainz";

// Stand-in discs while listens load or when ListenBrainz is unavailable.
export const placeholderListens: Listen[] = Array.from({ length: 5 }, () => ({
  track: "Song Title",
  artist: "Artist",
  album: "Album",
  durationMs: 0,
  coverUrl: null,
  listenedAt: null,
  playingNow: false,
}));
