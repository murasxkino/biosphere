# CHANGELOG

Format follows Keep a Changelog; versions follow SemVer once released. Dates are UTC-local project dates.

## [Unreleased]

### Milestone M3 — repository migration (2026-07-07) — engineering complete, tag pending owner parity pass

#### Added
- Git repository with the full constitution in `docs/`; README and CLAUDE.md at the root (CLAUDE.md carries the repository addendum: git replaces the transcript as recovery source).
- `legacy/biosphere.artifact.jsx` — v0.3.0-alpha committed verbatim as the parity oracle.
- Vite + React 18 + TypeScript (strict) scaffold; ESLint 9 + Prettier; Vitest + Testing Library + jsdom; GitHub Actions CI running typecheck / lint / test / build / build:artifact.
- **StorageAdapter** (`src/storage/`): window.storage for the artifact target, localStorage for local dev, in-memory fallback — semantics identical to the artifact's `store`.
- **Test suite, 74 tests green**: `dayKey` 4 AM rollover incl. month/year boundaries; schedule resolution at starts, boundaries, pre-dawn, night-overlap, empty day; `calcStreak`/`calcBest`/`habitSeries` incl. deleted-habit entries; storage adapters; AudioEngine graph construction per AUDIO_ENGINE.md recipes against a mock AudioContext (topology, crossfade teardown, chime, node budget); `App.boot` render test (replaces smoke.cjs); per-view fixture render tests.
- **`npm run build:artifact`** — permanent single-file Claude-artifact target (`dist/biosphere.artifact.jsx`: ESM, react-only imports, default-exported App) with a built-in module-init + SSR boot smoke.

#### Changed
- The single file split mechanically into modules per the ARCHITECTURE map, names unchanged: `src/domain|storage|audio|scenes|ui|views/` + `App.tsx`. The `sched` memo body moved verbatim to `domain/schedule.ts` for testability. Data shapes (Biosphere, Habit, Journal…) and component props are now typed.
- Behavior-preserving hardening required by strict TS: SceneCanvas guards a null 2D context; SettingsView guards an impossible delete-reassign target; `createStereoPanner` capability checks use `typeof`.

#### Verified
- Typecheck, lint, and all 74 tests clean; `vite build` clean; artifact bundle SSR smoke passes; legacy oracle still parses (esbuild). Live dev-server pass: boot → onboarding → Home (correct NOW/passed/next) → Immersion → full Grey Night flow → seal → persistence → Stillness → reload hydration; sound on/off against a real AudioContext; zero console errors.

## [0.3.0-alpha] — 2026-07-05

### Added
- **Passage between biospheres** (owner request): when the day moves on while the user is immersed in the ending biosphere, the chime sounds and a quiet capsule offers a ten-second countdown — *{Name} begins* over a draining accent line, with **Remain here** — then a portal transition (dim to black ~1 s, cross, emerge beneath the lifting dark) into the new biosphere or the Grey Night threshold. Tapping the capsule crosses immediately; any navigation cancels. Elsewhere, the toast behavior is unchanged. (FEATURE_SPEC §3.9.)
- Inline amber warning in Settings when Grey Night overlaps a biosphere's start, naming the consequence (soft guidance; no hard block).
- MIGRATION.md — Claude Code migration assessment answering the owner's six questions, with recommendation and bootstrap plan.

### Changed
- **Soundscape realism overhaul** (owner critique — "nature, not instruments"): all six soundscapes rebuilt on noise-first principles. Random-walked filter/gain parameters replace periodic LFOs; coherent gusts couple layers (wind body + blowing snow + whistle; canopy + leaf sizzle; alpine air). Volcanic sine pulses became resonant brown-noise knocks with clustered crackle, deep pops, and steam. Seaside became irregular stereo wave events (gather → break → foam wash) over a walked surf bed, with a rare gull. Forest birdsong is now noise-born bandpass-swept chirping in two species plus a distant third. Mountain lost its drone and pentatonic bells for layered alpine wind and a rare owl through the valley echo. Grey Night lost its synthetic tones for a two-voice cricket trill chorus, night breeze, and a far owl. New engine helpers: `_panTo`, `_walk`, `_gusts`, `_grain`, `_hoot`. The chime remains the app's one deliberately musical voice.

### Verified
- 2,713 lines parse-clean (esbuild); component-reference audit zero undefined; Node SSR smoke passes.

## [0.2.0-alpha] — 2026-07-05

### Added
- **SettingsView**: ambient-sound switch and volume slider; editable biosphere rows (name, start time, purpose, scene archetype) with guarded deletion (last-one protection, automatic habit reassignment with toast) and Add Biosphere; Grey Night start time with scheduling guidance; habit editor (name, biosphere assignment, optional 1–240 min focus timer) with Add Habit; two-step Reset everything; privacy caption.
- **Onboarding**: mountain-scene threshold with wordmark, tagline, canonical introduction, "begin with ambient sound" pill (default on), and Enter — audio starts inside the tap's user gesture.
- **App root**: persisted-state load with minimum 1,100 ms splash and default-safe hydration; debounced (700 ms) config persistence including sound preference; 20-second wall clock; schedule resolution (`currentId`, `endOf`) per FEATURE_SPEC §2; audio-follows-the-world scene selection with crossfades; live volume; one-time pointerdown restoration of saved sound; gentle phase-change announcements (toast + chime); `toggleSound`, `sealDay` (immediate journal persistence), `enterApp`, `doReset`, single-toast `say`; routing for all six views with graceful fallback when an immersion target no longer exists.

### Verified
- 2,488 lines parse-clean (esbuild); component-reference audit found zero undefined identifiers; full module server-rendered under React 18 in Node (SMOKE_OK) proving fault-free module initialization and boot render. Interactive browser checklist deferred to owner playthrough / M3.

## [0.1.0-alpha] — 2026-07-05

### Added
- Project foundation: archetype system, default schedule & habits, time model with 4 AM day rollover, streak/series math, versioned `window.storage` persistence layer with in-memory fallback.
- Procedural audio engine: cached noise synthesis (white/pink/brown), crossfading scene lifecycle, six canonical soundscapes (tundra, volcanic, seaside, forest, mountain, grey night), completion chime, autoplay-policy-safe enablement.
- Six generative canvas scenes with layered atmospherics and particles; `SceneCanvas` renderer (DPR cap 2, resize handling, `prefers-reduced-motion` stills, fault-tolerant draw loop).
- UI kit: 17 inline SVG icons, global stylesheet (typography, glass surfaces, inputs, keyframes, focus-visible and reduced-motion rules), shared Pill/Shell/SectionLabel/ToastBar/Splash components.
- Views: Home (timeline tiles with now/past/next states, Grey Night tile, live backdrop), Immersion (dissolving chrome, floating habits, optional focus timers with chime), Grey Night (guided reflection flow, sealing, amend, sealed review), Journal (collapsible nights), Stillness (streaks, bests, 28-day rhythm strips).
- Documentation constitution: 17 project documents.

### Changed
- Refactored HomeView tile-state logic into a named `stateOf` helper.

### Verified
- 2,041 lines parse-clean via esbuild; section-integrity audit passed after an interrupted write batch (no corruption).
