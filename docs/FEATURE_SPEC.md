# FEATURE SPECIFICATION

Canonical behavior. Where code and this document disagree, one of them is wrong — reconcile deliberately and record the decision in CHANGELOG.md.

## 1. Concepts & data model

**Archetype** — a visual + sonic identity: `tundra | volcanic | seaside | forest | mountain | night`. The first five are user-selectable; `night` is reserved for the Grey Night. Palette and scene definitions: ART_DIRECTION.md. Sound definitions: AUDIO_ENGINE.md.

**Biosphere** — `{ id, name, archetype, start: "HH:MM", purpose }`. Defaults:

| id | name | archetype | start | purpose |
|---|---|---|---|---|
| b_tundra | Tundra | tundra | 09:00 | Deep focus |
| b_volcanic | Volcanic | volcanic | 11:30 | Strenuous & crucial |
| b_seaside | Seaside | seaside | 13:00 | Rest & restoration |
| b_forest | Forest | forest | 15:30 | Social & emotional |
| b_mountain | Mountain | mountain | 19:00 | Spiritual practice |

**Habit** — `{ id, name, biosphereId, timer: minutes|null }`. Defaults: One deep work block (Tundra, 50) · Move your body (Volcanic, 30) · Rest, unplugged (Seaside, 20) · Reach out to someone (Forest, —) · Evening stillness (Mountain, 10).

**Night start** — `"HH:MM"`, default `21:30`.

**Journal** — `{ [dayKey]: { sealedAt: epochMs, entries: { [habitId]: { name, biosphere, done: boolean, note: string } } } }`. Entries are **snapshots**: they keep the habit's name and biosphere name as they were on that day, so later edits never rewrite history.

**Persistence keys** — `biosphere-config-v1` = `{ onboarded, bios, habits, nightStart, volume, soundLevel, musicLevel, soundPref, musicPref }`; `biosphere-journal-v1` = journal map. Values are JSON strings in `window.storage`. `musicPref` is additive (absent reads as on); `soundLevel`/`musicLevel` are additive (absent reads as the default blend: ambience 0.45, soundtrack 1).

## 2. Time model

- `t2m("HH:MM")` → minutes since midnight. All schedule comparisons use minutes.
- **Day rollover is 04:00.** `dayKey(date)` returns the previous calendar date for times before 4 AM, so a reflection finished at 00:30 belongs to the evening it concluded.
- **Current phase (`sched.currentId`)**: given biospheres sorted by start — if now < first start **or** now ≥ nightStart → `"night"`; otherwise the last biosphere whose start ≤ now.
- **Pre-dawn**: current is `"night"` **and** 04:00 ≤ now < first biosphere start. Displayed as "Before the day"; tiles read as upcoming, not passed.
- `sched.endOf(bioId)` → the next biosphere's start, or nightStart for the last one.
- A wall clock updates app time every 20 s.
- Known, accepted caveat: a nightStart set at/earlier than a biosphere's start makes that biosphere unreachable. Settings carries soft guidance and an inline amber warning when the overlap exists; no hard block in v1.

## 3. Views

### 3.1 Splash
Black field, wordmark **BIOSPHERE** (letterspaced), a small breathing glacial dot. Shown ≥ 1,100 ms while stored state loads.

### 3.2 Onboarding (first run or after reset)
Mountain scene behind a dark veil. Wordmark; serif italic tagline *One day, lived in nature.*; intro copy: *"Your day, arranged as landscapes. Habits rest inside each biosphere; when the Grey Night falls you reflect on them, one at a time, and seal the day."* A toggle pill **begin with ambient sound** (default ON) and an **Enter** button. Entering with sound starts the engine inside the tap's user gesture.

### 3.3 Home
Live scene of the current archetype (slow 1.8 s crossfade on change) under a vertical gradient veil. Header: wordmark + serif date (left); icon buttons sound, stillness, journal, settings (right). Now-status block: current biosphere name in large serif italic with `NOW · purpose · until {end}` in letterspaced caps — or *Before the day* with "{first} opens at {time}" pre-dawn, or *Grey Night · reflection & rest*.

Biosphere tiles, sorted by start: gradient of their archetype, drifting glow, three floating motes, time, name (serif 27), purpose (serif italic), habit-name preview line, archetype icon + chevron. States — **now**: accent border + glow + breathing NOW dot; **past**: 0.62 opacity, desaturated, "passed"; **next**: neutral. State rule: current id → now; night current → past (or next if pre-dawn); else compare starts against the current biosphere's.

Grey Night tile follows, always last: shows nightStart; NOW treatment when night and not pre-dawn; subtitle *nightly reflection, one habit at a time* → *the day settles — enter to reflect* (now) → *reflected — X of Y fulfilled* (sealed). Footer line: *Step through the day, one biosphere at a time.*

### 3.4 Immersion (inside a biosphere)
Enter animation: 1 s scale-settle fade (`enterScene`). Full-bleed scene + soundscape of the biosphere's archetype. All chrome sits in one layer that fades to opacity 0.05 over 1.6 s after **6.5 s** without pointer activity; any touch/move restores it instantly.

Header: back (top-left), centered `NOW`/`BIOSPHERE` eyebrow + name (serif 38) + *purpose · start – end*, and top-right the sound controls: a soundtrack toggle (only in scored worlds — §3.10) beside the ambient-sound toggle. Center: habits as floating text rows (archetype glyph + name), each drifting on a slow vertical float. Timed habits show `⏱ N MIN — TAP TO BEGIN`; tapping starts the countdown (`m:ss`, thin accent progress bar, 500 ms cadence); tapping again cancels; on completion a two-note chime sounds and the row reads `COMPLETE ✦`. Timer state is **ephemeral by design** — it exists to hold a session, not to score it, and resets on leaving. Untimed habits are inert text. Empty biosphere copy: *This biosphere is open. Give it a habit in settings, or simply be here.* Footer: `UNTIL {END}` when current, else `A QUIET WINDOW`.

### 3.5 Grey Night
Night scene, no UI fade (this view is conversation, not ambience). Habits ordered by their biosphere's start time.

**Flow mode** (unsealed): intro — moon icon, *Grey Night*, date, *"The day settles. N reflections await — one habit at a time."*, **Begin** (or, with no habits, guidance + **Return**). Per-habit steps — progress dots (past filled, current accent, future faint); biosphere name in its accent; habit name (serif 31); *Did you complete this today?*; pills **● Yes** / **○ Not today**; optional reflection textarea; **Back** / **Continue** (Continue disabled until an answer is chosen; answers and notes persist across Back). Outro — *The day is complete.* · *X of N habits fulfilled.* · *Rest well.* · **Back** / **Seal the day ✦**. Sealing writes the snapshot entries, persists the journal immediately, toasts *Day sealed ✦*.

**Sealed mode**: *Reflected* + date, read-only entry list (done dot, name, biosphere tag, indented italic note), buttons **Amend reflections** (re-enters flow pre-filled) and **Rest well** (exit).

### 3.6 Journal
Night-scene Shell titled *Journal — reflections, night by night*. Collapsible dated cards, newest first and newest open: date (serif), `X OF N FULFILLED`, chevron; expanded: entries as in sealed night. Empty state: moon + *"Nothing here yet. Reflections gather after each Grey Night."*

### 3.7 Stillness (stats)
Shell over the current archetype titled *Stillness — streaks & rhythm*. Two summary cards: **nights reflected**, **habits fulfilled** (all-time count of done entries). Per habit: name + biosphere tag in its accent; large serif current streak with `day streak · best N`; 28-day dot strip (filled accent = done, faint ring = reflected not done, near-invisible ring = no record). Streak counts consecutive `done` days ending today (or yesterday if tonight is unreflected); best is the longest historical run, floored by current. Footer: *Growth is quiet. So is this page.*

### 3.8 Settings
Shell over the current archetype. Sections:

**SOUND** — ambient-sound switch; soundtrack switch (sub-caption *one recorded piece per biosphere*); volume slider (0–1, default 0.7) governing both layers; caption *"Soundscapes are synthesized live in your browser — the soundtrack is the one recorded voice."*

**BIOSPHERES** — one row per biosphere: accent dot, name input, time input, purpose input, archetype select (five options), delete. Delete guard: refuse the last biosphere (*Keep at least one biosphere*); otherwise reassign its habits to the first remaining biosphere and toast *N habit(s) moved to {name}* / *Biosphere removed*. **Add Biosphere** appends `{ name: "New Biosphere", start: "17:00", archetype: "forest", purpose: "" }`. A quieter row for **Grey Night** exposes only its time, captioned *Grey Night should fall after your last biosphere.* When it doesn't, the caption gains a soft amber warning naming the consequence.

**HABITS** — one row per habit: name input, biosphere select, timer number input (1–240 min, blank = none), delete. **Add Habit** defaults to the earliest biosphere.

**DATA** — two-step reset (**Reset everything** → **Tap again to confirm**, reverting after a pause) restoring all defaults, clearing the journal, silencing audio, and returning to onboarding; toast *Everything reset*. Caption: *"Your schedule, habits and journal live only in this app's private storage."*

### 3.9 Passage between biospheres
When the clock moves the day forward while the user is immersed in the biosphere that just ended, BIOSPHERE offers passage rather than yanking or stranding them. The chime sounds and a quiet capsule rises at the bottom of the world: *{Name} begins* in the new biosphere's accent, a thin ten-second draining line, and a **Remain here** pill. Doing nothing completes the passage: the world dims to black over about a second — a breath between worlds — the view crosses into the new biosphere (or the Grey Night's threshold), and the new scene settles beneath the lifting dark. Tapping the capsule crosses immediately; **Remain here** dismisses it (*Staying a while*); navigating anywhere else cancels it. In every other context the transition stays a toast — Home's backdrop already follows the day on its own.

**The ear leads the eye**: from the moment the chime rings, both layers of the departing world begin a long dusk (τ 3.5 s — mostly gone by the countdown's end), and the arriving world's soundscape and piece bloom in slowly (τ 2.5 s) rather than at the ordinary entry pace. **Remain here** swells the world back to full (τ 0.8 s). Crossing early simply hands over from wherever the dusk has reached.

### 3.10 The soundtrack layer

Each archetype may carry one recorded musical piece (the manifest in `src/audio/tracks.ts`; ADR-8). The soundtrack plays **only inside immersion**: entering a scored world fades its piece in, leaving fades it out, and a passage crossing crossfades the old piece into the new world's (or into silence if the next world is unscored). The piece loops seamlessly — passes are joined by an equal-power crossfade at the seam, scheduled on the audio clock so background-tab throttling cannot misalign a join.

Ambience and soundtrack are **independent layers**: each has its own toggle (immersion header + Settings switch) and persisted preference; the master volume governs both; the chime sounds when either layer is open. The soundtrack preference is global, defaults to on, and worlds without a track show no music toggle at all. In artifact builds the layer is absent entirely. A failed track load is silent — the world simply stays unscored (retry by toggling).

**Layer level sliders** — hovering (or keyboard-focusing into) either immersion toggle reveals a vertical slider beneath it in a small glass panel: the layer's listening level (0–1, step 0.05), persisted globally (`soundLevel`/`musicLevel`). Defaults are the owner's by-ear blend from the M4 session — **ambience 0.45, soundtrack 1** (`DEFAULT_SOUND_LEVEL`/`DEFAULT_MUSIC_LEVEL` in `domain/constants.ts`): the world sits back, the soundtrack carries. The toggle stays the hard gate; the slider sets where "open" sits, gliding live (τ 0.15 s). The panels live inside the dissolving chrome and are invisible until sought. On touch devices hover does not exist, so the sliders stay tucked away — Settings' master volume remains the touch-side level control.

## 4. System behaviors

- **Sound toggle** (everywhere): flips the ambience layer inside the user gesture; if Web Audio is unsupported, toast *Audio isn't available in this browser*. The **soundtrack toggle** does the same for the music layer (§3.10).
- **Soundscape selection**: immersion → that biosphere's archetype; Grey Night → night; otherwise the current phase's archetype. Changes crossfade (see AUDIO_ENGINE.md). The soundtrack follows immersion only (§3.10).
- **Autoplay restore**: if `soundPref` was saved on, the app arms a one-time pointerdown listener and starts audio on the first tap of the session. The soundtrack needs no restore step — it can only begin inside an immersion entered by a tap.
- **Phase transitions**: when `sched.currentId` changes during use the chime sounds; if the user is immersed in the biosphere that just ended, the passage capsule appears instead of a toast (§3.9); otherwise toast *{name} begins*. Suppressed on initial load.
- **Persistence cadence**: config saves are debounced 700 ms after any change (post-load, in-app only); the journal is written immediately on seal. Storage calls are try/caught; failure falls back to memory silently.
- **Toasts**: single, bottom-center glass pill, auto-dismiss ~2.6 s, never stacked, never blocking.
