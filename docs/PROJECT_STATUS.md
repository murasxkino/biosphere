# PROJECT STATUS

**Updated:** 2026-07-05 · **Version:** 0.3.0-alpha · **Current milestone:** M2 complete — recommending Milestone M3 = migration to Claude Code (see MIGRATION.md), awaiting approval.

## Code state (verified this session)

`biosphere.jsx` — **2,713 lines**, delivered to outputs. Parse: esbuild PARSE_OK · component-reference audit: zero undefined · Node SSR smoke: passes (module init + boot render fault-free).

## Completed this milestone (owner critiques + refinements)

- **Passage between biospheres** (owner request #1): chime + bottom capsule with the new biosphere's name in its accent, a ten-second draining line, tap-to-cross, and **Remain here**; on expiry a portal transition (dim to black ~0.95 s → view crosses → emerge under a 1.25 s lifting veil) into the new biosphere or the Grey Night threshold. Any navigation cancels; elsewhere in the app the toast behavior is unchanged. Spec'd as FEATURE_SPEC §3.9.
- **Soundscape realism overhaul** (owner request #2): all six scenes rebuilt noise-first — random-walked parameters instead of periodic LFOs, coherent gusts, grain-based events, irregular stereo wave sets with break-and-wash, noise-born birdsong, resonant geologic knocks, cricket trill chorus, owls with valley echo; drone/bells/synthetic tones removed. Full canon in AUDIO_ENGINE.md. New helpers: `_panTo`, `_walk`, `_gusts`, `_grain`, `_hoot`.
- Settings now shows an inline amber warning when Grey Night overlaps a biosphere start (names the consequence).
- Decisions resolved: deleted-habit history stays journal-only by design; copy pass found no drift; input font sizes confirmed ≥16 px for mobile keyboards.

## Remaining work

**M3 (migration)** per MIGRATION.md, then **M4 (QA & tuning)** in the repo — including the two items honestly deferred because they need a live loop: by-ear audio parameter tuning and device performance profiling.

## Known issues & notes

- Audio parameters are first-pass, analytically chosen; expect M4 by-ear trims (levels, event rates).
- Interactive behaviors (passage timing feel, veil pacing) statically verified only; browser confirmation lands in the owner's next playthrough / M4.
- Carried caveats unchanged: focus timers ephemeral by design; night-overlap is warned, not blocked.

## Recommendation

**Migrate now.** This conversation has taken the project as far as an artifact sandbox usefully can; the next work (listening-driven tuning, device QA, tests, long-term maintenance) belongs in a repository with Claude Code. The full assessment — maturity, prototype-quality areas, debt ordering, post-move refactors, pre-transition documents, and final adjustments — is in MIGRATION.md.

## Recovery

Conversation transcript remains the recovery source until git replaces it: `/mnt/transcripts/2026-07-05-03-58-19-biosphere-habit-app-build.txt`.

## Next recommended milestone

**M3 — Repository migration to Claude Code.**
