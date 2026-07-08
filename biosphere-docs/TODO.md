# TODO

## Milestone M2 — ✅ shipped 2026-07-05 (v0.3.0-alpha)

Owner critiques delivered: automatic **passage between biospheres** (10 s countdown, portal crossing, Remain here — FEATURE_SPEC §3.9) and the **nature-first soundscape overhaul** (AUDIO_ENGINE.md). Also shipped: Grey Night overlap warning; deleted-habit stats decision (journal-only, by design); copy pass (clean); mobile input sizing confirmed.

## Milestone M3 — Repository migration to Claude Code (awaiting approval)

- [ ] Owner: open Claude Code with a fresh repo; bring `biosphere.jsx`, the `biosphere-docs/` folder, and MIGRATION.md.
- [ ] Bootstrap per MIGRATION.md: Vite + React + TypeScript, ESLint + Prettier, Vitest + Testing Library.
- [ ] Split the single file per the ARCHITECTURE module map; keep `legacy/biosphere.artifact.jsx` as the parity reference.
- [ ] Introduce `StorageAdapter` (window.storage for artifact builds; localStorage for local dev).
- [ ] Tests first for the correctness core: `dayKey` 4 AM rollover, schedule resolution (pre-dawn, boundaries, night-overlap), `calcStreak`/`calcBest`/`habitSeries`; AudioEngine graph construction against a mock AudioContext; boot render test replacing smoke.cjs.
- [ ] Add `build:artifact` single-file bundle target for shipping back to Claude artifacts.
- [ ] Parity check against v0.3.0-alpha; tag `v0.3.0`.

## Milestone M4 — QA & tuning (post-migration)

- [ ] By-ear soundscape tuning session per scene (levels, gust character, event rates) — current values are first-pass.
- [ ] Passage feel check in-browser (countdown pacing, veil timing, cancel paths).
- [ ] Device profiling of the scene loop; adjust particle ceilings if needed.
- [ ] Full manual matrix (ENGINEERING_GUIDE) incl. reduced-motion, storage-absent, no-WebAudio.
- [ ] Fold in owner playthrough findings.

## Parking

See BACKLOG.md — nothing there starts without an explicit go.
