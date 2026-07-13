/* ========================================================================== */
/*  SOUNDTRACK MANIFEST — one looped recording per archetype (ADR-8).         */
/*                                                                            */
/*  To swap or add a track: drop the file in public/music/ and point the      */
/*  archetype's entry at it (bump the ?v= query so cached listeners hear      */
/*  the new one). null = that world is unscored and shows no music toggle.    */
/*  `level` is the by-ear trim of the piece against the scene's beds —       */
/*  the M4 tuning knob. Full guidance: docs/AUDIO_ENGINE.md.                  */
/* ========================================================================== */

export interface Track {
  url: string;
  level: number;
}

export const MUSIC_TRACKS: Record<string, Track | null> = {
  tundra: { url: "/music/tundra.wav?v=1", level: 0.4 },
  volcanic: { url: "/music/volcanic.wav?v=1", level: 0.4 },
  seaside: { url: "/music/seaside.wav?v=1", level: 0.4 },
  forest: { url: "/music/forest.wav?v=1", level: 0.4 },
  mountain: { url: "/music/mountain.wav?v=1", level: 0.4 },
  night: null,
};
