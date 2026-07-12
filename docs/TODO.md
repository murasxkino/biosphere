# TODO

## Milestone M2 — ✅ shipped 2026-07-05 (v0.3.0-alpha)

Owner critiques delivered: automatic **passage between biospheres** (10 s countdown, portal crossing, Remain here — FEATURE_SPEC §3.9) and the **nature-first soundscape overhaul** (AUDIO_ENGINE.md). Also shipped: Grey Night overlap warning; deleted-habit stats decision (journal-only, by design); copy pass (clean); mobile input sizing confirmed.

## Milestone M3 — Repository migration to Claude Code — ✅ shipped 2026-07-12 (v0.3.0)

- [x] Owner: open Claude Code in the handoff folder; repo initialized in place (git history begins at the verbatim handoff).
- [x] Bootstrap per MIGRATION.md: Vite + React 18 + TypeScript strict, ESLint + Prettier, Vitest + Testing Library, CI workflow.
- [x] Split the single file per the ARCHITECTURE module map; `legacy/biosphere.artifact.jsx` kept as the parity reference.
- [x] Introduce `StorageAdapter` (window.storage for artifact builds; localStorage for local dev; memory fallback).
- [x] Tests for the correctness core — 74 green: `dayKey` 4 AM rollover, schedule resolution (pre-dawn, boundaries, night-overlap), `calcStreak`/`calcBest`/`habitSeries` incl. deleted-habit entries; AudioEngine graph construction against a mock AudioContext; boot render test replacing smoke.cjs; per-view render tests.
- [x] Add `build:artifact` single-file bundle target (with built-in SSR boot smoke) for shipping back to Claude artifacts.
- [x] **Owner:** manual parity pass against v0.3.0-alpha (ENGINEERING_GUIDE checklist) via `npm run dev` — approved 2026-07-12; `v0.3.0` tagged.
- [ ] Owner, when ready: connect a GitHub remote (`gh auth login` + `gh repo create`, or `git remote add origin …`) — CI activates on first push. _(License decided: proprietary, all rights reserved — see `LICENSE`. Visibility: private.)_
- [x] M4-entry chore: first `npm run format` (2026-07-12) — `src/`, root markdown & html; `legacy/` and `docs/` excluded by `.prettierignore`. Check + builds green after.

## Milestone M4 — QA & tuning (post-migration)

- [ ] By-ear soundscape tuning session per scene (levels, gust character, event rates) — current values are first-pass.
- [ ] Passage feel check in-browser (countdown pacing, veil timing, cancel paths).
- [ ] Device profiling of the scene loop; adjust particle ceilings if needed.
- [ ] Full manual matrix (ENGINEERING_GUIDE) incl. reduced-motion, storage-absent, no-WebAudio.
- [ ] Fold in owner playthrough findings.

## Parking

See BACKLOG.md — nothing there starts without an explicit go.
