# Store screenshots

Five shots per STORE_LISTING § Screenshots, captured 2026-08-22.

`6.9-inch/` — **1320 × 2868**, the size App Store Connect requires for iPhone.
Apple derives the smaller sizes from these; a separate 6.5" set is no longer
required, which is why STORE_LISTING's "6.9" and 6.5"" line has been amended.

| File | Shot |
|---|---|
| `01-home.png` | Home, Tundra reading NOW over the living timeline |
| `02-immersion.png` | Inside Tundra, chrome awake, the habit floating |
| `03-night-question.png` | *Did you complete this today?* — the one that explains the product |
| `04-sealed.png` | The sealed night: *Reflected*, 4 of 5, two reflections visible |
| `05-stillness.png` | Stillness — 26 nights, 112 habits, 28 days of rhythm |

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
