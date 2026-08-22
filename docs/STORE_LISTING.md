# APP STORE LISTING

Draft copy for App Store Connect. Everything here answers to UX_GUIDELINES' style sheet — the listing is the first thing anyone reads, and it should sound like the app rather than like an ad for it. Character limits are Apple's and are counted below.

Nothing here may promise a feature the app does not have; Apple rejects for that, and it would be the wrong way to begin regardless.

## Name — 30 char limit

```
BIOSPHERE
```

*9 characters.* **Must be checked for availability** before the app record is created — a collision is plausible. If taken, the fallback keeps the tagline doing the work: `BIOSPHERE: One Day in Nature` (28).

## Subtitle — 30 char limit

```
One day, lived in nature.
```

*25 characters.* The app's own tagline, unchanged since M0.

## Promotional text — 170 char limit, editable without review

```
Your day as a sequence of landscapes you step into. Habits rest inside them. At night, one honest look back — then the day is sealed.
```

*133 characters.*

## Description — 4000 char limit

```
BIOSPHERE turns your day into a landscape you inhabit.

Not a tracker with a nature theme. A place.

The day is arranged as a sequence of biospheres — cold clarity for morning focus, heat for the work that costs something, water for rest, green warmth for the people you love, violet stillness at dusk. Each one is a living scene with its own weather and its own sound. You step inside, and the interface fades until only the world and a few floating words remain.

There are no checkboxes in daylight. This is the heart of it.

Your habits live inside their biospheres as quiet text, not as a list to be defeated. Nothing asks you to prove anything while the day is still being lived. Then the Grey Night falls, and the day's only accounting happens: one habit at a time, one question — did you complete this today? — answered without judgment, with room for a sentence if you have one. Then you seal the day, and it is done.

That asymmetry is the product. The day is for being. The night is for looking back.

SOUND THAT ISN'T A RECORDING OF NATURE — IT IS NATURE, GENERATED

Every soundscape is synthesized live on your device as you listen. Wind that gusts through three layers at once and never repeats. Waves that gather, break, and wash out, each a different size. Birdsong born from filtered noise rather than samples, phrased differently every time. Crickets that trill the way crickets actually trill. Nothing loops, because nothing is a recording.

Beneath it, each biosphere carries its own piece of music, and the two layers are yours to balance — either alone, or together, or neither.

WHAT IT WILL NEVER DO

No points. No badges. No levels. No streak flames. No confetti. No red dots. No notifications asking where you've been. No leaderboards, no sharing, no comparison. The reward for keeping faith with yourself is a quiet grey dot and the private knowledge of having done it.

The only notification BIOSPHERE will ever send is the one you ask for, when a focus timer you started reaches its end.

YOURS, AND ONLY YOURS

No account. No sign-up. No analytics of any kind. The app makes no network requests at all — it has no servers to talk to. Every word you write stays on your device. It works on a plane, in a tunnel, forever.

MAKE IT YOUR OWN

Rename, retime, and re-theme every biosphere. Add your own, or fewer. Assign habits where they belong, with an optional focus timer for the ones that want one. Set when your night begins.

Stillness, the quietest page, keeps your streaks and a 28-day rhythm for each habit — countable, never celebrated.

BIOSPHERE is for people who want structure without noise. If you have ever closed a habit app because it felt like a second job, this was built for you.
```

*~2,600 characters.*

## Keywords — 100 char limit, comma-separated, no spaces

```
habit,reflection,journal,mindful,calm,focus,ambient,ritual,intention,evening,quiet,soundscape,rest
```

*98 characters.* Deliberately excludes words already in the name and subtitle — Apple indexes those separately, so repeating them wastes the field.

## What's New — first release

```
The first release.
```

## Category

**Primary: Health & Fitness.** It is where mindfulness and habit apps are searched for, and the neighbourhood BIOSPHERE belongs to.
**Secondary: Lifestyle.**

## Age rating

**4+.** No objectionable content. Journal entries are user-written but private to the device and never shared, so Apple's user-generated-content provisions do not apply.

## Privacy nutrition label

**Data Not Collected** — the whole questionnaire. No data types, no tracking, no third-party SDKs that collect anything. This is unusual enough to be a genuine differentiator, and it is worth answering carefully so it is exactly right.

## Screenshots — required, not yet made

**Taken 2026-08-22 — `assets/screenshots/6.9-inch/`, 1320 × 2868.** Two corrections to what this section assumed: only the **6.9" set is required** (Apple derives the rest, 6.5" is no longer asked for), and they could **not** be taken on the owner's phone — an iPhone 16 is a 6.1" device and cannot produce that size. They were captured on the iPhone 16 Pro Max simulator, running the same build verified on hardware. See `assets/screenshots/README.md` for how, including the seeded journal behind them. The five, in this order:

1. **Home** at mid-morning — the timeline over a living Tundra, one tile reading NOW.
2. **Immersion** — a biosphere with its chrome dissolved, habits floating.
3. **The Grey Night question** — *Did you complete this today?* with the two pills. The screenshot that explains the whole product.
4. **The sealed night** — *reflected — 4 of 5 fulfilled*, with a written reflection visible.
5. **Stillness** — the 28-day rhythm strips, whispering.

Capture with reduced motion off, sound on, and a journal with a few real days in it — an empty app photographs as an empty app. (Done: 28 seeded days with deliberate gaps, today walked and sealed live for shots 3 and 4.)

## URLs

**Live 2026-08-22** — served by GitHub Pages from the separate public repo `murasxkino/biosphere-site`; the app repo stays private. Source of the pages is `site/` in this repo, mirrored across.

| Field | URL |
|---|---|
| **Privacy policy URL** (required) | `https://murasxkino.github.io/biosphere-site/privacy.html` |
| **Support URL** (required) | `https://murasxkino.github.io/biosphere-site/support.html` |
| **Marketing URL** (optional) | `https://murasxkino.github.io/biosphere-site/` — or leave blank for the first release |

To change a page: edit `site/` here first (and `docs/PRIVACY_POLICY.md` if the policy itself changes — it remains the source of truth), then copy into the public repo and push.

**Hosting note:** GitHub Pages will not serve from a private repository on a free plan, and `murasxkino/biosphere` is private and should stay that way. Publish the policy from a separate small public repo, or a free static host. Do not make the app repository public to solve this.

## Decisions still owned by the owner

1. ~~**The support email that will appear publicly.**~~ **Decided 2026-08-22: `biospheresupport@gmail.com`** — a dedicated mailbox rather than a personal one. Live in `site/privacy.html`, `site/support.html` and `docs/PRIVACY_POLICY.md`; use the same address in App Store Connect.
2. **Price** — free, or one-time paid. Subscriptions and advertising are refused by DESIGN_PHILOSOPHY, so this is a two-way choice.
3. **App name availability**, per the Name section above.
4. ~~**The exact effective date** on the privacy policy.~~ **Decided 2026-08-22:** phrased as *from the first public release* rather than a calendar date — accurate whenever the app ships, and one less thing to remember on submission day.
