# PROJECT STATUS

**Updated:** 2026-07-12 · **Version:** 0.3.0 (tagged `v0.3.0`) · **Current milestone:** M3 closed 2026-07-12 — M4 (QA & tuning) is open.

## Code state (verified this session)

The project now lives in a git repository (this folder), migrated per MIGRATION.md:

- `legacy/biosphere.artifact.jsx` — the v0.3.0-alpha single file, committed verbatim as the parity oracle (esbuild parse re-verified after the move).
- `src/` — the module split per the ARCHITECTURE map, TypeScript strict, names kept identical to the oracle: `domain/` (constants, types, time, stats, schedule, uid), `storage/` (StorageAdapter: window.storage → localStorage dev → memory), `audio/engine.ts`, `scenes/`, `ui/`, `views/`, `App.tsx`.
- **Verification:** typecheck clean · lint clean (one documented warning: ImmersionView's deliberate every-render timer effect) · **74/74 tests green** (Vitest) · `vite build` clean · `npm run build:artifact` emits `dist/biosphere.artifact.jsx` (react-only imports, default-exported App) and its SSR boot smoke passes.
- **Live browser pass (Vite dev server):** boot → onboarding → Enter → Home (correct NOW/passed/next for the wall clock) → Immersion → full Grey Night flow → seal (journal persisted immediately, snapshot entries + trimmed note correct) → Stillness (streak 1, best 1) → reload hydrates straight to Home with the sealed tile reading *reflected — 4 of 5 fulfilled*. Sound toggled on/off against a real AudioContext. Zero console errors or warnings.
- **Owner parity pass (ENGINEERING_GUIDE checklist): approved 2026-07-12.** Assisted re-verification 2026-07-11 was green end to end: verification floor (74/74 tests, both builds, artifact SSR smoke) plus a full live in-browser pass at parity — reflect/seal/amend, persistence, streaks, settings live-edit, keyboard a11y — with zero console errors.

## Completed this milestone (M3, per MIGRATION.md)

- Repo bootstrapped: Vite + React 18 + TypeScript (strict), ESLint 9 + Prettier, Vitest + Testing Library, GitHub Actions CI (typecheck / lint / test / build / build:artifact).
- Constitution moved to `docs/`; README and CLAUDE.md promoted to the repo root; CLAUDE.md gained the repository addendum (git is the recovery source now).
- Module split executed mechanically; the `sched` memo body was extracted verbatim to `domain/schedule.ts` so the correctness core is unit-testable.
- StorageAdapter with identical get/set semantics; all call sites still funnel through `store.get/set`.
- Test suite: dayKey rollover incl. month/year edges, schedule boundaries + pre-dawn + night-overlap, streaks/series incl. deleted-habit entries, storage adapters + memory fallback, AudioEngine graph construction per AUDIO_ENGINE.md recipe against a mock AudioContext, App boot render (replaces smoke.cjs), per-view fixture render tests.
- Permanent `build:artifact` target with built-in SSR smoke.

## Remaining work

1. **M4 (QA & tuning)** per TODO.md — by-ear soundscape tuning (owner listening live), passage feel check, device profiling, full manual matrix.
2. Connect the private GitHub remote — see the machine note under Known issues.

## Known issues & notes

- Audio parameters remain first-pass analytical values; M4 tunes by ear.
- Prettier is configured but has not yet been run over `src/` — deferred until after the parity pass so the split stays byte-close to the oracle for review. First `npm run format` is an M4-entry chore.
- ESLint carries one deliberate warning (ImmersionView timer-completion effect runs every render — verbatim artifact behavior).
- No GitHub remote yet: the GitHub CLI (`gh`) is **not installed** on this machine. Install it (e.g. `winget install --id GitHub.cli`), then `gh auth login` + `gh repo create biosphere --private --source=. --remote=origin`; or create the private repo on github.com and `git remote add origin <url>`. CI activates on first push.
- **License** and **repo visibility** are now decided: proprietary — all rights reserved (see `LICENSE`) — and private, on GitHub. The remote itself is not yet connected (see the `gh` note above).
- Carried caveats unchanged: focus timers ephemeral by design; night-overlap warned, not blocked.

## Recovery

Git replaces the conversation transcript. The verbatim v0.3.0-alpha oracle is `legacy/biosphere.artifact.jsx`; every change since is a commit on `main`.

## Next recommended milestone

**M4 — QA & tuning**, beginning with the by-ear soundscape session (live, with you listening).
