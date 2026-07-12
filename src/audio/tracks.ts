/* ========================================================================== */
/*  SOUNDTRACK MANIFEST — one looped recording per archetype (ADR-8).         */
/*                                                                            */
/*  To swap or add a track: drop the file in public/music/ and point the      */
/*  archetype's entry at it (bump the ?v= query so cached listeners hear      */
/*  the new one). null = that world is unscored and shows no music toggle.    */
/*  Full guidance: docs/AUDIO_ENGINE.md § The soundtrack layer.               */
/* ========================================================================== */

export const MUSIC_TRACKS: Record<string, string | null> = {
  tundra: "/music/tundra.wav?v=1",
  volcanic: null,
  seaside: null,
  forest: "/music/forest.wav?v=1",
  mountain: null,
  night: null,
};
