export interface ListenBrainzListen {
  listened_at?: number;
  track_metadata?: {
    artist_name?: string;
    track_name?: string;
    release_name?: string;
    additional_info?: { duration_ms?: number };
    mbid_mapping?: { caa_id?: number; caa_release_mbid?: string };
  };
}

export interface Listen {
  track: string;
  artist: string;
  album: string;
  durationMs: number | null;
  coverUrl: string | null;
  listenedAt: number | null;
  playingNow: boolean;
}

// Build a Cover Art Archive thumbnail URL only from well-formed release and image ids.
const getCoverUrl = (
  mapping: NonNullable<ListenBrainzListen["track_metadata"]>["mbid_mapping"],
) => {
  const release = mapping?.caa_release_mbid ?? "";
  const image = String(mapping?.caa_id ?? "");

  if (!/^[a-f\d]{8}(?:-[a-f\d]{4}){3}-[a-f\d]{12}$/i.test(release)) return null;
  if (!/^\d+$/.test(image)) return null;

  // Go straight to the Internet Archive item Cover Art Archive redirects to, saving a hop per cover.
  return `https://archive.org/download/mbid-${release}/mbid-${release}-${image}_thumb250.jpg`;
};

// Reduce a ListenBrainz listen to the fields the Music screen displays.
export const toListen = (
  { track_metadata: meta, listened_at }: ListenBrainzListen,
  playingNow = false,
): Listen => {
  const duration = meta?.additional_info?.duration_ms;

  return {
    track: meta?.track_name?.trim() || "Unknown song",
    artist: meta?.artist_name?.trim() || "Unknown artist",
    album: meta?.release_name?.trim() ?? "",
    durationMs: typeof duration === "number" && duration > 0 ? duration : null,
    coverUrl: getCoverUrl(meta?.mbid_mapping),
    // Playing-now has no scrobble time yet, so stamp it with now for when it is served from the fallback.
    listenedAt:
      typeof listened_at === "number"
        ? listened_at
        : playingNow
          ? Math.floor(Date.now() / 1000)
          : null,
    playingNow,
  };
};

// Put a song that is playing right now first, dropping its duplicate scrobble if present.
export const withPlayingNow = (
  recent: Listen[],
  playing: Listen | undefined,
) => {
  if (!playing) return recent;

  const [first, ...rest] = recent;
  const repeated =
    first?.track === playing.track && first?.artist === playing.artist;

  return [playing, ...(repeated ? rest : recent)];
};

// A saved response is from the past, so nothing in it can still be playing now.
export const withoutPlayingNow = (listens: Listen[]) =>
  listens.map((listen) => ({ ...listen, playingNow: false }));
