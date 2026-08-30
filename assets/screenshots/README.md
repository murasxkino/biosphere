# Store screenshots

Five shots per STORE_LISTING § Screenshots, captured 2026-08-22.

`6.9-inch/` — **1320 × 2868**.
`6.5-inch/` — **1284 × 2778**, derived from the 6.9" set (see below).
`13-inch-ipad/` — **2064 × 2752**, shot natively on an iPad Pro 13-inch (M5).

## The iPad set, and what it settled

Taken 2026-08-30. `TARGETED_DEVICE_FAMILY` is `"1,2"`, so **iPad is enabled and a reviewer will open the app there**, but no layout had ever been designed or seen at that size — PROJECT_STATUS carried it as an open risk for a fortnight.

**It holds up.** The chrome centres into a readable column instead of stretching, the scenes fill the width, and the whole day fits in one view — Tundra through Grey Night with no scrolling, which the phone cannot do. The immersion subtitle that wraps to two lines on a phone fits on one here. Nothing was changed to achieve this; the layout simply survives the size.

Four shots: `01-home` (the full day at once, the iPad's own argument), plus Volcanic, Forest and Mountain.

**Both sets are needed.** An earlier note here claimed Apple derives the smaller
sizes and that a 6.5" set was obsolete. That was wrong: App Store Connect
rejected the 1320 × 2868 files outright when uploaded to the 6.5" slot, which
accepts only 1242 × 2688, 2688 × 1242, 1284 × 2778 or 2778 × 1284.

The 6.5" set was **not** re-shot. The two aspect ratios differ by 0.42%
(0.46025 against 0.46220), so each image was scaled to the exact target width
and then had **12 px taken off the bottom** — never stretched, because
distorted typography is obvious in a store listing and these shots are mostly
type. The crop comes entirely off the bottom so the status bar and header
geometry stay pixel-identical to the 6.9" set; the removed strip is dark
background in every shot (verified by sampling it, mean RGB 12–43).

Regenerate with the snippet in this repo's history, or re-derive: scale to
width 1284, `extract` from top 0 to height 2778.

| File | Shot |
|---|---|
| `01-home.png` | Home, Tundra reading NOW over the living timeline |
| `02-immersion.png` | Inside Tundra, chrome awake, the habit floating |
| `03-night-question.png` | *Did you complete this today?* — the one that explains the product |
| `04-sealed.png` | The sealed night: *Reflected*, 4 of 5, two reflections visible |
| `05-stillness.png` | Stillness — 26 nights, 112 habits, 28 days of rhythm |
| `06-volcanic.png` | Volcanic at its hour — two habits, both timed |
| `07-forest.png` | Forest out of hours — light shafts, and *a quiet window* |
| `08-mountain.png` | Mountain at its hour — the moon up, spiritual practice |

`06` and `07` were added 2026-08-30 at the owner's request, to show more than one world. The habits in them are **the owner's own**: Volcanic carries *Push Workout*, *Cardio* and *Ab Routine*; Forest carries *Reach out to friends*, *Talk to her* and *Spend time with family*. An earlier pass used names invented here as placeholders; they were replaced, because words on an App Store page should be the owner's. They live in the screenshot seed only, never in `DEFAULT_HABITS` — the shipped defaults are unchanged.

`08` (added 2026-08-30) carries the owner's own *Pray*, *Scripture study* and *Meditate*. **The owner wrote "Mediate"; it was shot as "Meditate"** — beside Pray and Scripture study in a biosphere whose purpose is *Spiritual practice*, the intent is unmistakable, and a typo on a public App Store page is worse than an unasked question. Say the word and it changes back.

Forest was shot deliberately out of hours, so its header reads `BIOSPHERE` rather than `NOW` and its footer reads *a quiet window* instead of a countdown. Between the two, they show that a biosphere is somewhere you can step into whether or not it is your hour.

Extras, not part of the five: `extra-day-complete.png` (*The day is complete* —
an alternative to 04) and `03-night-question-empty.png` (the question with an
empty reflection field, if the written note reads as clutter).

## How they were taken, and why not on the phone

**On the iPhone 16 Pro Max simulator, not on DARCY.** The owner's iPhone 16 is a
6.1" device and physically cannot produce 1320 × 2868; simulator captures are
exactly the required size and are accepted by App Store Connect. The app is the
same Debug build that was verified on hardware.

Status bar set to Apple's 9:41 with full bars and a charged battery via
`simctl status_bar override`. iOS shows no AM/PM, so 9:41 reads correctly for
both the morning shots and the Grey Night ones.

**The journal behind them is seeded, not lived.** STORE_LISTING warns that "an
empty app photographs as an empty app", and Stillness in particular is nothing
without a month behind it. A seed script was injected into the *built* `.app`'s
`index.html` — never into `src/`, never committed — writing 28 days of plausible
practice straight into the same IndexedDB store the app reads. It leaves gaps
and misses on purpose: a perfect grid would be a lie, and an ugly one. Today was
left unsealed so the Grey Night flow could be walked and photographed live; the
reflections in `03` and `04` were typed by hand during that walk.

The same injected script keeps the immersion chrome awake, which otherwise
dissolves 6.5 s after the last touch — right in use, impossible to photograph.

To retake: rebuild for a 6.9" simulator, re-inject a seed, and walk the flow
again. Nothing here is reproducible from the repo alone by design — the seed is
a photography prop, and props do not belong in the app.
