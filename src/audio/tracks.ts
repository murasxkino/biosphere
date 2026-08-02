/* ========================================================================== */
/*  SOUNDTRACK MANIFEST — one looped recording per archetype (ADR-8).         */
/*                                                                            */
/*  Shipped files are 256 kbps AAC (.m4a); the WAV masters live in            */
/*  audio-masters/, outside every build. To swap or add a track: put the      */
/*  master there, encode it (AUDIO_ENGINE § The soundtrack layer), drop the   */
/*  .m4a in public/music/ and point the archetype's entry at it — bumping     */
/*  the ?v= query so cached listeners hear the new one.                       */
/*  null = that world is unscored and shows no music toggle.                  */
/*  `level` is the by-ear trim of the piece against the scene's beds —       */
/*  the M4 tuning knob. Full guidance: docs/AUDIO_ENGINE.md.                  */
/* ========================================================================== */

export interface Track {
  url: string;
  level: number;
}

export const MUSIC_TRACKS: Record<string, Track | null> = {
  tundra: { url: "/music/tundra.m4a?v=1", level: 0.4 },
  volcanic: { url: "/music/volcanic.m4a?v=1", level: 0.4 },
  seaside: { url: "/music/seaside.m4a?v=1", level: 0.4 },
  forest: { url: "/music/forest.m4a?v=1", level: 0.4 },
  mountain: { url: "/music/mountain.m4a?v=1", level: 0.4 },
  night: null,
};
