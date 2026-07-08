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
- **FR-11 Procedural audio.** A unique synthesized soundscape per archetype, crossfading between scenes, with a global on/off and volume. No audio files.
- **FR-12 Persistence.** Configuration and journal persist across sessions via `window.storage`; sound preference is restored on the next user gesture (autoplay policy). All data is private to the user.
- **FR-13 Reset.** A guarded, two-step full reset returning the app to first-run state.
- **FR-14 Phase awareness.** The app knows the current biosphere from the clock, announces transitions gently (toast + chime), and treats pre-dawn hours correctly.

## Non-functional requirements

- **NFR-1 Performance.** Smooth scene animation on mobile: device-pixel-ratio capped at 2, bounded particle counts, a single `requestAnimationFrame` loop per canvas, no unbounded per-frame allocation growth.
- **NFR-2 Accessibility.** `prefers-reduced-motion` renders scenes as still images and disables CSS animation; visible focus states; icon buttons carry labels; interactive tiles are keyboard-activatable; touch targets ≥ 40 px.
- **NFR-3 Privacy.** No network calls beyond font loading. No analytics. Data never leaves the storage sandbox.
- **NFR-4 Resilience.** Storage failures degrade to in-memory operation without crashing; scene draw errors never take down the app; the audio engine degrades silently where Web Audio is unsupported.
- **NFR-5 Zero assets.** All imagery is generative canvas; all sound is synthesized; icons are inline SVG.
- **NFR-6 Maintainability.** Clean separation of concerns within the single file (see ARCHITECTURE.md), one source of truth per fact, no duplicated logic.

## Explicit non-requirements (v1 will not include)

Push or local notifications; accounts, sync, or social features; data export; gamification of any kind; advertising; multiple day templates. Deferred items and permanent refusals are catalogued in BACKLOG.md.

## Platform constraints (binding)

- Deliverable is a **single-file React artifact** (`biosphere.jsx`) with a default export and no required props.
- Imports limited to React itself; styling via inline styles plus one injected `<style>` block; Tailwind arbitrary values are unavailable in this environment.
- **`localStorage`/`sessionStorage` are forbidden**; persistence uses the async `window.storage` API with an in-memory fallback.
- Fonts load from Google Fonts CDN; no other external resources.
- Real photography/video and recorded audio are excluded (rights + asset policy) — a deliberate creative constraint the generative approach answers.
