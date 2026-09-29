import type { Listen } from "@/lib/listenbrainz";

// Stand-in discs while listens load or when ListenBrainz is unavailable.
export const placeholderListens: Listen[] = Array.from({ length: 4 }, () => ({
  track: "Song Title",
  artist: "Artist",
  album: "Album",
  durationMs: 0,
  coverUrl: null,
  listenedAt: null,
  playingNow: false,
}));
