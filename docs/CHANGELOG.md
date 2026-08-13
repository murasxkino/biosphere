# CHANGELOG

Format follows Keep a Changelog; versions follow SemVer once released. Dates are UTC-local project dates.

## [Unreleased]

### Milestone M7 — native platform work (in progress)

#### Added
- **The native bridge** (`src/native/bridge.ts`, FEATURE_SPEC §3.11) — the only place the app touches the device. It imports nothing statically: native is detected through the global Capacitor injects, and plugins load by dynamic `import()` only once we know we are on a device. The web build code-splits them into a chunk it never fetches, and the artifact marks `@capacitor/*` external, so **every top-level import in the single file is still `react` alone**.
- **A local notification when a focus timer closes.** iOS freezes JS timers in the background, so it is **scheduled when the timer starts** and cancelled if the timer is stopped, closes in the foreground, or is abandoned by leaving the biosphere. Permission is asked the first time a timer is started rather than at launch. Copy is the habit's name and *your window has closed* — the timer never claims the habit is done. The only notification the app will ever send.
- **Haptics** at the two moments already marked by a chime: light when a timer closes, medium when the day is sealed. Nothing else vibrates.
- 10 bridge tests (native detection incl. a malformed global, no-op behaviour off native, id stability and range, refusal to schedule in the past). Suite: **119 green**.

#### Fixed
- Settings' sound caption said soundscapes are synthesized "in your browser" — true of the web build, wrong the moment the app is native. Now "on your device", which is accurate in all three targets.

#### Documentation
- **`docs/MAC_SETUP.md`** — the day-one script for the build machine: install list, proving the web side green before touching anything native, generating `ios/`, the audio-session work called out as the release blocker it is, a concrete way to verify the blind-written notification and haptics in a minute rather than fifty, and the gotchas worth not rediscovering.
- **`docs/PRIVACY_POLICY.md`** and **`docs/STORE_LISTING.md`** — publishable policy plus every App Store Connect field with character counts. Claims in the policy were verified against the source: the only `fetch` reads a file from inside the app, and the Google Fonts import survives solely in the artifact branch, which the native build tree-shakes away. The app contacts no server.
- **`docs/FUTURE_CHANGES.md`** — a sealed post-publication constitution, not to be acted on until v1.0 is live on the App Store; CLAUDE.md carries the seal so it binds every session. It records what changes once real people depend on the app (resets stop being harmless, schema changes become one-way doors, releases are gated, feature requests are not mandates, and we still refuse to measure) and opens the post-launch queue with the **first-run tutorial** — the problem it solves, the conventional answers the constitution forbids, and the constraint that the world must teach rather than the interface.

## [0.4.0] — 2026-08-08

The soundtrack release, and the app's first steps out of the browser. M4 added a recorded musical layer beside the synthesized soundscapes, tuned every world by ear with the owner listening, and gave the listener control of the blend; M6 then made the codebase ready to live inside a native shell. Verification at the tag: **109 tests green**, all three targets building, artifact SSR smoke clean.

### Milestone M6 — native readiness (2026-07-15 → 2026-08-08)

The project committed to shipping BIOSPHERE on the Apple App Store; `docs/APP_STORE_ROADMAP.md` is the plan of record (ADR-9: Capacitor over WKWebView).

#### Changed
- **WKWebView feel** (Phase B). No long-press callout anywhere, no iOS text auto-sizing, no overscroll chaining out of a scroll container, and no selection or double-tap-zoom delay on chrome — while inputs and the user's own journal text stay fully selectable and copyable.
- **Typefaces ship with the app.** Cormorant Garamond and Outfit are bundled as six variable-font woff2 files (200 KB, latin + latin-ext) instead of loading from the Google Fonts CDN, so the app renders offline. The font source is build-aware via `__ARTIFACT_BUILD__`: the artifact sandbox, which cannot serve bundled files, keeps the CDN import; Rollup drops the unused branch from the web bundle.
- **Safe-area insets.** `--sat/--sab/--sal/--sar` (from `env(safe-area-inset-*)`, 0px fallbacks) now pad every edge-touching surface — Home, Immersion chrome, Grey Night, Shell pages, Onboard, toasts, and the passage capsule — so nothing collides with a notch or home indicator. Desktop and artifact layouts are byte-identical to before.
- **The soundtrack ships as AAC.** 256 kbps `.m4a` in `public/music/` replaces the WAVs — **47 MB → 8.4 MB**, a 5.6× reduction in what every build and the eventual iOS bundle carries. The lossless masters moved to `audio-masters/`, outside every build, with a re-encode recipe beside them. The encode became canonical only after the owner judged it indistinguishable from the masters in a blind, level-matched, gapless A/B (including at the loop seam), per APP_STORE_ROADMAP §3.
- **Durable storage.** The StorageAdapter prefers **IndexedDB** over localStorage on the web and native targets: asynchronous (the journal is written the instant a day is sealed), and with no 5 MB cliff to grow into. `window.storage` still wins in the artifact. Existing localStorage sessions are **adopted lazily per key** on first read, so upgrading never costs a user their journal.

#### Added
- **The app icon** — the owner's artwork at `assets/icon.png`: a sphere holding a horizon and a single low sun, in the day's own gradient from tundra blue to mountain gold. 1024², sRGB, no alpha, full-bleed square as iOS requires.
- **The Capacitor shell's portable half** (Phase B): `@capacitor/core|cli|ios` 8.5 and `capacitor.config.ts` — bundle id, `#05070b` backgrounds so nothing flashes at launch, `contentInset: "never"` so WKWebView does not double-count the CSS safe areas, and `scrollEnabled: false` to remove the whole-page rubber band (the app is a fixed stage; scrolling belongs to `.bsScroll`). `npm run ios:add` / `ios:sync` / `ios:open` for the build machine, and `assets/README.md` specifying the icon and launch-screen sources with the design constraints the artwork must answer to.
- `src/storage/indexedDb.ts` and 8 tests covering round-trip, nested journal shapes, adoption of a previous session, refusal to adopt malformed leftovers, never overwriting newer data, and backend preference order. Suite: **109 green** (was 101). `fake-indexeddb` added as a dev dependency.

### Milestone M4 (in progress)

#### Added
- **The soundtrack layer** (owner-requested, approved 2026-07-12; FEATURE_SPEC §3.10, ADR-8): one recorded musical piece per archetype, looped inside immersion. Engine gained per-layer buses (scenes → sceneBus, music → musicBus, master carries only volume); the chime now sounds when either layer is open. `MusicPlayer` (`src/audio/music.ts`) fetches and decodes on first entry, caches ≤ 2 tracks, joins passes with an equal-power seam crossfade chained on the audio clock (`onended` — immune to background-tab timer throttling), and fails silent. Manifest `src/audio/tracks.ts` — swap a track by dropping a file in `public/music/` and editing one line. Immersion header gained a soundtrack toggle (scored worlds only) beside the ambient toggle; Settings gained a Soundtrack switch; `musicPref` persists additively (absent = on). Artifact builds detect the sandbox and omit the layer entirely. All five worlds are scored (owner recordings, WAV; volcanic/seaside/mountain landed later the same day), each behind a per-track `level` trim in the manifest — first-pass 0.4, tuned by ear in the M4 session; Grey Night stays unscored by design.
- **Layer level sliders** (owner-requested mid-session 2026-07-12; FEATURE_SPEC §3.10): hovering or focus-tabbing into either immersion toggle reveals a vertical glass slider — the layer's listening level (0–1, default 1, persisted as `soundLevel`/`musicLevel`). The buses now open to the set level rather than to 1 (`setSceneLevel`/`setMusicLevel`); toggles remain the hard gates. Hover-capable devices only; Settings' master volume stays the touch path.
- Tests: 101 green (was 74) — MusicPlayer availability/graph/seam-chain/crossfade/failure/supersession/cache/level-trim, engine bus topology + chime dual-gating + layer-level gating + passage dusk/bloom/cancel + default-blend, view toggle and slider tests.

#### Changed
- **The default layer blend is the owner's** (2026-07-14): fresh installs and resets now open with ambience at 0.45 under the soundtrack at 1.0 — the blend the owner chose by ear in the tuning session (`DEFAULT_SOUND_LEVEL`/`DEFAULT_MUSIC_LEVEL`, `domain/constants.ts`). Was 1.0/1.0. Existing configs are untouched (the keys are additive).
- **The passage now leads with the ear** (owner feel-check, 2026-07-13; FEATURE_SPEC §3.9): from the chime, both layers of the departing world begin a τ 3.5 s dusk — receding but alive through the countdown — and the arriving world's soundscape and piece bloom in at τ 2.5 s instead of the ordinary 0.9. *Remain here* swells the world back (τ 0.8 s). Previously the old world held full level until the portal, then crossfaded at the standard pace.

#### Fixed
- Slider hover ergonomics (owner-reported in the tuning session): the 6px gap between toggle and panel dropped hover mid-travel, randomly hiding the slider before the cursor arrived — bridged by an invisible hit-extender, plus a 0.18 s closing grace and a mid-drag hold (`:active`). Clicking a toggle no longer pins its panel open: the keyboard-access rule moved from `:focus-within` to `:has(:focus-visible)`, so pointer clicks don't latch focus visibility.

#### M4 entry chores (2026-07-12)
- First full Prettier pass over the repo — the chore deferred through M3 so the split stayed byte-close to the oracle; `legacy/` and `docs/` remain excluded via `.prettierignore`. Verification floor green after.
- Private GitHub remote connected (`murasxkino/biosphere`); Actions CI activated on first push — run green end to end.

## [0.3.0] — 2026-07-12

### Milestone M3 — repository migration (engineering 2026-07-07 · closed 2026-07-12)

#### Added
- Git repository with the full constitution in `docs/`; README and CLAUDE.md at the root (CLAUDE.md carries the repository addendum: git replaces the transcript as recovery source).
- `legacy/biosphere.artifact.jsx` — v0.3.0-alpha committed verbatim as the parity oracle.
- Vite + React 18 + TypeScript (strict) scaffold; ESLint 9 + Prettier; Vitest + Testing Library + jsdom; GitHub Actions CI running typecheck / lint / test / build / build:artifact.
- **StorageAdapter** (`src/storage/`): window.storage for the artifact target, localStorage for local dev, in-memory fallback — semantics identical to the artifact's `store`.
- **Test suite, 74 tests green**: `dayKey` 4 AM rollover incl. month/year boundaries; schedule resolution at starts, boundaries, pre-dawn, night-overlap, empty day; `calcStreak`/`calcBest`/`habitSeries` incl. deleted-habit entries; storage adapters; AudioEngine graph construction per AUDIO_ENGINE.md recipes against a mock AudioContext (topology, crossfade teardown, chime, node budget); `App.boot` render test (replaces smoke.cjs); per-view fixture render tests.
- **`npm run build:artifact`** — permanent single-file Claude-artifact target (`dist/biosphere.artifact.jsx`: ESM, react-only imports, default-exported App) with a built-in module-init + SSR boot smoke.
- **LICENSE** — proprietary, all rights reserved; repo visibility resolved to private (MIGRATION.md §6 choices settled).

#### Changed
- The single file split mechanically into modules per the ARCHITECTURE map, names unchanged: `src/domain|storage|audio|scenes|ui|views/` + `App.tsx`. The `sched` memo body moved verbatim to `domain/schedule.ts` for testability. Data shapes (Biosphere, Habit, Journal…) and component props are now typed.
- Behavior-preserving hardening required by strict TS: SceneCanvas guards a null 2D context; SettingsView guards an impossible delete-reassign target; `createStereoPanner` capability checks use `typeof`.

#### Verified
- Typecheck, lint, and all 74 tests clean; `vite build` clean; artifact bundle SSR smoke passes; legacy oracle still parses (esbuild). Live dev-server pass: boot → onboarding → Home (correct NOW/passed/next) → Immersion → full Grey Night flow → seal → persistence → Stillness → reload hydration; sound on/off against a real AudioContext; zero console errors.
- Assisted parity re-run 2026-07-11: verification floor green again; full live in-browser pass at parity, zero console errors. **Owner manual parity pass (ENGINEERING_GUIDE checklist): approved 2026-07-12 — tagged `v0.3.0`** (MIGRATION DoD step 6).

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
