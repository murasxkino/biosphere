# MIGRATION ASSESSMENT — BIOSPHERE → Claude Code

**Date:** 2026-07-05 · **Assessed at:** v0.3.0-alpha (2,713 lines, feature-complete)

## Recommendation

**Yes — migrate now, as Milestone M3, before QA.** This conversation has carried the project exactly as far as an artifact sandbox usefully can. Everything that remains — tuning soundscapes by ear, profiling scenes on real devices, exercising interactive flows, building a test suite, and decades-not-days maintainability — requires the loop only a repository gives: edit → hot reload → listen/watch → commit. There is also a practical ceiling here: every change to a 2,700-line single file is a surgical text operation with no version control; in a repo it's a reviewed diff. Continuing past this point in-conversation would start costing quality.

The honest framing: the *product design* is mature; the *engineering substrate* is deliberately artifact-shaped. Migration converts the second without touching the first.

---

## 1. Is the codebase mature enough to move into Claude Code?

Yes, and this is close to the ideal window. What makes it ready:

- **Feature-complete and behaviorally frozen.** Every FR is implemented; v0.3.0-alpha is a stable parity target to migrate *against*, which is what makes a split safe.
- **A documentation constitution Claude Code consumes natively.** CLAUDE.md, the canonical FEATURE_SPEC, ARCHITECTURE (with the module map and ADRs), and AUDIO_ENGINE recipes mean a Claude Code session starts with full context instead of archaeology.
- **Clean internal boundaries.** The single file is already organized as eight strictly-ordered logical modules with one-way dependencies; the split is mechanical, not architectural.
- **A versioned, tiny persistence schema** (`biosphere-config-v1`, `biosphere-journal-v1`) that survives the move unchanged.
- **Deterministic pure core** (time, schedule, streaks) that is immediately unit-testable.

Waiting longer would only grow the monolith and the migration risk.

## 2. What parts are still prototype-quality?

Honestly:

- **Soundscape parameters.** The v0.3 architecture is right (noise-first, walked, gusted), but every level, rate, and Q was chosen analytically, not by ear. This is the single largest quality gap and is *unfixable here* — it needs live listening iteration.
- **Zero automated tests.** Verification so far = parse check + reference audit + one SSR smoke render. The correctness core (4 AM rollover, schedule edges, streak math) has never been exercised by a test.
- **The single-file form itself** — fine for an artifact, prototype-grade for a product.
- **Performance is unprofiled.** Particle ceilings and the rAF loop were budgeted on reasoning, not measured on a low-end device.
- **No error boundary**; a render exception would white-screen rather than degrade.
- **Interactive timing feel** (passage countdown, veil pacing, UI-dissolve rhythm) verified statically only.
- **The smoke test is a throwaway script**, not a suite.

Not prototype-quality (worth saying): the data model, persistence strategy, view architecture, accessibility groundwork, and the design system are production-shaped already.

## 3. What technical debt should be addressed first?

In order, immediately post-move:

1. **Module split** per the ARCHITECTURE map (table below) — everything else hangs off it.
2. **TypeScript, strict.** The data shapes (Biosphere, Habit, JournalDay, Entry) are small and stable; typing them now prevents drift forever.
3. **Tests for the correctness core** (Vitest): `dayKey` around 04:00 and midnight; `sched` at boundaries, pre-dawn, and night-overlap; `calcStreak`/`calcBest`/`habitSeries` incl. deleted-habit entries; then AudioEngine *graph-construction* tests against a mock AudioContext (assert node topology per recipe, not sound).
4. **Lint/format/CI** (ESLint + Prettier + a test-on-push action) so quality is enforced, not remembered.
5. **StorageAdapter interface** — two implementations: `window.storage` (artifact target) and `localStorage` (local dev; forbidden in artifacts, correct in a repo). All call sites already funnel through `store.get/set`, so this is an hour, not a week.
6. **Error boundary** wrapping the view layer with an on-brand quiet fallback.

## 4. What should be refactored immediately after moving?

- **The split itself**, mechanically, keeping names identical for diff-ability:

| Single-file section | Repo module |
|---|---|
| ARCH, defaults, keys | `src/domain/constants.ts` |
| time + stats utils | `src/domain/time.ts`, `src/domain/stats.ts` |
| store | `src/storage/adapter.ts` (+ `windowStorage.ts`, `localStorage.dev.ts`) |
| AudioEngine + AUDIO | `src/audio/engine.ts` (+ `recipes/` if it grows) |
| scene helpers + makeScene + SceneCanvas | `src/scenes/*.ts`, `src/scenes/SceneCanvas.tsx` |
| Ic, STYLE, atoms (Pill, Shell, ToastBar, Splash, Handoff…) | `src/ui/` |
| six views | `src/views/` |
| App root | `src/App.tsx` |

- **Extract copy strings** to `src/domain/copy.ts` (the voice sheet becomes enforceable and localizable).
- **Replace smoke.cjs** with `App.boot.test.tsx` plus per-view render tests using fixture props.
- **Do not** introduce state libraries, routers, or component abstraction beyond this — ARCHITECTURE ADR-7 stands; the app is a shallow star and should stay one.

## 5. What documentation or files should be generated before the transition?

Already generated (travels with the project): the full 17-document constitution, updated through v0.3.0-alpha this session, plus this assessment. CLAUDE.md remains the operating contract — Claude Code reads it first by convention.

To create in the repo's first commit (specified here so nothing is improvised):

- **Scaffold:** Vite + React 18 + TypeScript; deps: `react`, `react-dom`; dev: `typescript`, `vite`, `@vitejs/plugin-react`, `vitest`, `@testing-library/react`, `jsdom`, `eslint`, `prettier`, `esbuild`.
- **`legacy/biosphere.artifact.jsx`** — the v0.3.0-alpha file, committed verbatim as the parity oracle.
- **`docs/`** — the constitution, moved as-is; README.md promoted to repo root.
- **`scripts/build-artifact`** — an esbuild single-file bundle target (`npm run build:artifact`) so the project can *always* re-emit a Claude-artifact build. Dual-target delivery is a permanent requirement, not a bridge.
- **`.gitignore`, LICENSE** (owner's choice — flagging that it's undecided), **CI workflow**.
- **CLAUDE.md addendum** (small): git replaces the conversation transcript as recovery source; milestone/stop-and-approve process unchanged; docs remain one-fact-one-home.

## 6. Is there anything I would change before handing this project over?

Done in this session precisely to make the handover clean: shipped both owner critiques so migration starts from the true product (a mid-feature handover multiplies risk); resolved the open UX decisions (night-overlap → inline warning; deleted-habit stats → journal-only by design); synced every canonical document, so the docs — not the chat history — are the handover.

Remaining choices that belong to you, flagged rather than assumed: **license**, **repo visibility/host**, and whether M4's by-ear tuning happens with you listening live (recommended — it's your product's soul, and it's an hour well spent).

One thing I would *not* change: the constraints. Zero assets, procedural everything, `window.storage` for the artifact target — these are now identity, and the repo must preserve the ability to honor them via `build:artifact`.

---

## Bootstrap sequence (M3 definition of done)

1. New repo; scaffold as specified; commit constitution + legacy artifact file.
2. Split per the table; StorageAdapter; app boots locally with dev storage.
3. Test suite green (time/schedule/streaks/audio-graph/boot).
4. `build:artifact` emits a single-file build; loaded as an artifact, it behaves identically to `legacy/`.
5. Manual parity pass against v0.3.0-alpha (ENGINEERING_GUIDE checklist).
6. Tag `v0.3.0`. Update PROJECT_STATUS/CHANGELOG. Stop for approval; M4 begins with your ears.
