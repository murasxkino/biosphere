# PRODUCT REQUIREMENTS

Version 1 scope. Behavioral detail lives in FEATURE_SPEC.md; this file states *what must exist* and the constraints it must exist within.

## Functional requirements

- **FR-1 Timeline home.** A single-screen timeline of the day's biospheres as animated tiles, ordered by start time, rendered over a live scene of the current biosphere, with the current phase clearly stated.
- **FR-2 Five default biospheres.** Tundra (deep focus), Volcanic (strenuous & crucial), Seaside (rest & restoration), Forest (social & emotional), Mountain (spiritual practice) — provided on first run with sensible times.
- **FR-3 Full schedule editability.** Users can rename, retime, repurpose, re-theme (scene archetype), add, and delete biospheres. Deleting the last biosphere is prevented; deleting one that holds habits reassigns them safely.
- **FR-4 Habits.** Named habits assignable to any biosphere, each with an optional focus-timer length. Add, edit, reassign, delete.
- **FR-5 Immersion view.** Entering a biosphere fills the screen with its living scene and soundscape. UI chrome fades to near-invisible after inactivity and returns on touch. Habits appear as quiet floating text — no checkboxes, no daytime completion controls.
- **FR-6 Focus timers.** Tapping a timed habit starts a countdown with a thin progress line; a soft chime marks completion. Timers are an aid only — they never mark a habit done.
- **FR-7 Grey Night.** A special night biosphere (default 21:30) hosting the day's only accounting: for each habit, one screen asking "Did you complete this today?" with Yes / Not today plus an optional typed reflection; then the day is sealed. Sealed days can be amended.
- **FR-8 Journal.** A reverse-chronological record of sealed nights: date, fulfillment count, per-habit outcome and reflection text.
- **FR-9 Stillness (stats).** Nights reflected, habits fulfilled, and per-habit current streak, best streak, and a 28-day dot strip. No gamified decoration.
- **FR-10 Onboarding & splash.** A calm branded splash on load; a first-run onboarding that states the idea and offers "begin with ambient sound."
- **FR-11 Procedural audio.** A unique synthesized soundscape per archetype, crossfading between scenes, with a global on/off and volume. Every *soundscape* is synthesized live — this is permanent identity, not a limitation.
- **FR-15 Soundtrack layer** (added M4, 2026-07-12; ADR-8, FEATURE_SPEC §3.10). One recorded musical piece per archetype, looped inside immersion, independent of the soundscape layer: separate toggle, separate persisted preference, separate level. Recorded audio is admitted **for this layer only** — it is the single sanctioned exception to the generative-everything rule, and it supersedes the earlier "no audio files" clause of FR-11.
- **FR-12 Persistence.** Configuration and journal persist across sessions via `window.storage`; sound preference is restored on the next user gesture (autoplay policy). All data is private to the user.
- **FR-13 Reset.** A guarded, two-step full reset returning the app to first-run state.
- **FR-14 Phase awareness.** The app knows the current biosphere from the clock, announces transitions gently (toast + chime), and treats pre-dawn hours correctly.

## Non-functional requirements

- **NFR-1 Performance.** Smooth scene animation on mobile: device-pixel-ratio capped at 2, bounded particle counts, a single `requestAnimationFrame` loop per canvas, no unbounded per-frame allocation growth.
- **NFR-2 Accessibility.** `prefers-reduced-motion` renders scenes as still images and disables CSS animation; visible focus states; icon buttons carry labels; interactive tiles are keyboard-activatable; touch targets ≥ 40 px.
- **NFR-3 Privacy.** **Zero runtime network calls** (tightened for the native target — fonts and soundtrack ship in the bundle). No analytics. No accounts. Data never leaves the device.
- **NFR-4 Resilience.** Storage failures degrade to in-memory operation without crashing; scene draw errors never take down the app; the audio engine degrades silently where Web Audio is unsupported.
- **NFR-5 Generative visuals, near-zero assets.** All imagery is generative canvas; icons are inline SVG; every soundscape is synthesized. The only shipped media are the per-archetype soundtrack recordings (FR-15) and the two bundled typefaces.
- **NFR-6 Maintainability.** Clean separation of concerns within the single file (see ARCHITECTURE.md), one source of truth per fact, no duplicated logic.

## Explicit non-requirements (v1 will not include)

Push notifications of any kind; accounts, sync, or social features; data export; gamification of any kind; advertising; multiple day templates. Deferred items and permanent refusals are catalogued in BACKLOG.md.

**One exception, taken 2026-07-15 for the iOS target:** a **local notification when a focus timer completes** — and nothing else. It carries the chime to a user whose screen has gone dark; it is the completion signal FR-6 already promises, not a new channel. Phase-change and re-engagement notifications remain permanently refused (BACKLOG; IMMERSION_PRINCIPLES 9).

## Platform constraints (binding)

Three delivery targets, one codebase (ARCHITECTURE ADR-1; MIGRATION §5; APP_STORE_ROADMAP ADR-9):

1. **iOS app** — the primary target as of 2026-07-15: Capacitor over WKWebView, submitted to the App Store.
2. **Web build** — `vite build`, the development and preview target.
3. **Single-file Claude artifact** — `npm run build:artifact`, default-exported `App`, React-only imports, persisting via `window.storage`. Permanent capability; the soundtrack layer is absent here by design.

Binding across all three:

- Styling via inline styles plus one injected `<style>` block; no CSS framework.
- Persistence goes through the **StorageAdapter** (ADR-2), never a bare storage API: `window.storage` in the artifact, durable native storage on iOS, `localStorage` in web dev, in-memory as the floor.
- **No runtime network dependency.** Fonts and soundtrack are bundled; nothing is fetched from a CDN at runtime.
- Real photography and video remain excluded. Recorded audio is admitted only as the soundtrack layer (FR-15).
