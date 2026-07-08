# PROJECT STATUS

**Updated:** 2026-07-07 · **Version:** 0.3.0 (untagged — tag lands after the owner parity pass) · **Current milestone:** M3 engineering complete — awaiting owner approval before the tag and M4.

## Code state (verified this session)

The project now lives in a git repository (this folder), migrated per MIGRATION.md:

- `legacy/biosphere.artifact.jsx` — the v0.3.0-alpha single file, committed verbatim as the parity oracle (esbuild parse re-verified after the move).
- `src/` — the module split per the ARCHITECTURE map, TypeScript strict, names kept identical to the oracle: `domain/` (constants, types, time, stats, schedule, uid), `storage/` (StorageAdapter: window.storage → localStorage dev → memory), `audio/engine.ts`, `scenes/`, `ui/`, `views/`, `App.tsx`.
- **Verification:** typecheck clean · lint clean (one documented warning: ImmersionView's deliberate every-render timer effect) · **74/74 tests green** (Vitest) · `vite build` clean · `npm run build:artifact` emits `dist/biosphere.artifact.jsx` (react-only imports, default-exported App) and its SSR boot smoke passes.
- **Live browser pass (Vite dev server):** boot → onboarding → Enter → Home (correct NOW/passed/next for the wall clock) → Immersion → full Grey Night flow → seal (journal persisted immediately, snapshot entries + trimmed note correct) → Stillness (streak 1, best 1) → reload hydrates straight to Home with the sealed tile reading *reflected — 4 of 5 fulfilled*. Sound toggled on/off against a real AudioContext. Zero console errors or warnings.

## Completed this milestone (M3, per MIGRATION.md)

- Repo bootstrapped: Vite + React 18 + TypeScript (strict), ESLint 9 + Prettier, Vitest + Testing Library, GitHub Actions CI (typecheck / lint / test / build / build:artifact).
- Constitution moved to `docs/`; README and CLAUDE.md promoted to the repo root; CLAUDE.md gained the repository addendum (git is the recovery source now).
- Module split executed mechanically; the `sched` memo body was extracted verbatim to `domain/schedule.ts` so the correctness core is unit-testable.
- StorageAdapter with identical get/set semantics; all call sites still funnel through `store.get/set`.
- Test suite: dayKey rollover incl. month/year edges, schedule boundaries + pre-dawn + night-overlap, streaks/series incl. deleted-habit entries, storage adapters + memory fallback, AudioEngine graph construction per AUDIO_ENGINE.md recipe against a mock AudioContext, App boot render (replaces smoke.cjs), per-view fixture render tests.
- Permanent `build:artifact` target with built-in SSR smoke.

## Remaining work

1. **Owner:** manual parity pass against v0.3.0-alpha (ENGINEERING_GUIDE checklist) in the browser — `npm run dev`. Then approve.
2. Tag `v0.3.0` (MIGRATION DoD step 6) once the parity pass is clean.
3. **M4 (QA & tuning)** per TODO.md — by-ear soundscape tuning, device profiling, full manual matrix.

## Known issues & notes

- Audio parameters remain first-pass analytical values; M4 tunes by ear.
- Prettier is configured but has not yet been run over `src/` — deferred until after the parity pass so the split stays byte-close to the oracle for review. First `npm run format` is an M4-entry chore.
- ESLint carries one deliberate warning (ImmersionView timer-completion effect runs every render — verbatim artifact behavior).
- No GitHub remote yet: `gh` is not authenticated on this machine. `git remote add origin <url>` (or `gh auth login` + `gh repo create`) whenever ready; CI activates on first push.
- **License** and repo visibility/host remain the owner's call (flagged in MIGRATION.md §6, still undecided).
- Carried caveats unchanged: focus timers ephemeral by design; night-overlap warned, not blocked.

## Recovery

Git replaces the conversation transcript. The verbatim v0.3.0-alpha oracle is `legacy/biosphere.artifact.jsx`; every change since is a commit on `main`.

## Next recommended milestone

Owner parity pass → tag `v0.3.0` → **M4 — QA & tuning**, beginning with the by-ear soundscape session (recommended live, with you listening).
