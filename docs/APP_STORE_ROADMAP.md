# APP STORE ROADMAP — BIOSPHERE on iOS

**Decided:** 2026-07-15 · **Target:** BIOSPHERE as a downloadable iOS app on the Apple App Store.

This document is the plan of record for leaving the browser. It answers *how* we ship, *what stands in the way*, and *who clears each obstacle*. Behavioral truth still lives in FEATURE_SPEC.md; this file governs the platform move only.

## 1. Where we stand

The product is mature; the delivery vehicle is not. Every line under `src/` (≈6,450 lines, 101 tests green) transfers to iOS untouched — the schedule core, the six procedural soundscapes, the canvas scenes, the design system, the journal. What does not exist is a native shell, and five platform debts stand between the repo and a bundle Apple will accept (§4).

## 2. ADR-9 — Capacitor, not React Native, not a PWA

**Decision: wrap the existing web app with [Capacitor](https://capacitorjs.com) in a WKWebView shell.**

- **React Native is a rewrite, not a port.** The canvas scenes would need Skia and the ~450-line Web Audio engine has no RN equivalent — random-walked filter graphs, noise-grain scheduling, and equal-power seam crossfades are not expressible in `expo-av`. Two to three months of work whose most likely outcome is *losing the sound we just tuned by ear*. Refused.
- **A PWA cannot reach the App Store.** Apple does not accept them. Dead end for the stated goal.
- **Capacitor preserves 100% of the code.** Canvas and Web Audio are both sound in modern WKWebView.

Two earlier decisions now pay for themselves: **ADR-2's StorageAdapter** makes the swap to native storage a one-file change, and the **dual-target `build:artifact` discipline** already proved this codebase tolerates more than one delivery target. Adding iOS makes it three: web, artifact, native.

**Known risk — App Review Guideline 4.2 (minimum functionality).** Apple rejects thin web wrappers. BIOSPHERE is substantively rich, wholly offline, and free of browser chrome, so it should clear the bar — but *feeling* native is a work item, not an afterthought: real icon, native launch screen, safe areas, haptics, no rubber-band scroll, no tap-highlight artifacts.

## 3. The audio is the crown jewel — how it stays safe

The owner's judgment, recorded here as a constraint on every phase that follows: **the soundscape and soundtrack layers are the app's best feature, and platform work may not degrade them.** Concretely:

- **The WAV masters are never destroyed.** They are committed in git history permanently, and live in the repo under `audio-masters/` (excluded from every build). Whatever ships is a *derived* artifact. ✅ done 2026-07-15.
- **Re-encoding is A/B'd by ear before it becomes canonical.** ✅ done 2026-07-15: the 256 kbps encode was judged against the masters in a blind, level-matched, gapless A/B (both files decoded and played in parallel; the switch changed only which reached the ear) and found indistinguishable, including at the loop seam. Only then did the manifest move off the masters.
- **Encode conservatively.** 256 kbps AAC-LC, 44.1 kHz stereo — well above transparency for ambient music, still ~10× smaller than WAV. Bitrate is cheap; the owner's trust is not.
- **The seam crossfade absorbs encoder padding.** Because passes are joined by an equal-power crossfade rather than butt-joined (AUDIO_ENGINE § The soundtrack layer), AAC's priming samples cannot produce the click a hard loop would. Verify by ear across at least one seam per track anyway.
- **The by-ear values are frozen.** No platform task may alter a tuned recipe parameter in `engine.ts` or a `level` in `tracks.ts`. Those came from a live listening session and are canonical (AUDIO_ENGINE § Known state & tuning).
- **On iOS, "safe" also means audible.** The single largest audio risk is not encoding — it is `AVAudioSession`. Left unconfigured, a muted ring switch silences the entire app. Phase C treats this as a release blocker, not a polish item.

## 4. The platform gap (verified 2026-07-15)

| Debt | Consequence if unfixed | Phase |
|---|---|---|
| Fonts load from the Google Fonts CDN (`ui/style.ts`) | Typography fails offline; reviewers test in airplane mode | A |
| 47 MB of WAV, copied into every build by Vite | ~10× bundle bloat; slow install, wasted device storage | A |
| No `env(safe-area-inset-*)` handling | Content collides with notch and home indicator — reads as a website | A |
| Journal in `localStorage` | WKWebView storage is evictable under pressure — silent loss of someone's reflections | A |
| No `AVAudioSession` configuration | Silent switch mutes the app; backgrounding kills audio and freezes focus timers | C |

## 5. Phases

**Phase A — Web hardening.** *No Mac, no Apple account, no owner input required.* Self-host both typefaces · encode the soundtrack to AAC (§3 rules) and move masters out of the build · safe-area insets throughout · durable storage · verify zero network calls at runtime.

**Phase B — Capacitor shell.** Capacitor config and iOS project, app icon and native launch screen pipeline, WKWebView tuning (disable bounce, text-size adjust, tap highlight, long-press callout). *Native build requires macOS or CI.*

> **Portable half done 2026-08-02.** `@capacitor/core|cli|ios` 8.5 installed; `capacitor.config.ts` written (bundle id, `contentInset: never` so the CSS safe areas are not double-counted, `scrollEnabled: false` to kill the whole-page rubber band, matching `#05070b` backgrounds against a launch flash); WKWebView tuning in `ui/style.ts` (no long-press callout, no text auto-sizing, no overscroll chaining, no selection or double-tap zoom on chrome — while the user's own words stay selectable); `ios:add` / `ios:sync` / `ios:open` scripts; `assets/README.md` specifies the icon and launch-screen sources. **Remaining, and it needs a Mac:** `npm run ios:add` to generate the native project, then the icon artwork (owner's approval) and a first device build.

**Phase C — Native platform work.** `AVAudioSession` `playback` category (survives the silent switch) · background-audio mode · interruption handling for calls and other apps · focus timers recomputed from wall clock on resume · **local notification on timer completion** (§6) · haptics on seal and chime. *Requires a real device in the loop.*

**Phase D — Store preparation.** 1024 px icon · screenshots per required device size · privacy policy URL · description, keywords, age rating · privacy nutrition label (truthfully "no data collected" — a genuine selling point).

**Phase E — TestFlight → Review → Release.** Internal TestFlight build, real-device soak, submit. Budget one rejection round.

**Calendar estimate: 6–10 weeks**, of which perhaps 3–4 weeks is engineering; the remainder is owner-gated decisions and Apple's queues.

## 6. Product decisions taken

- **Local notifications, timer completion only** (owner, 2026-07-15). The chime already exists; a notification is that same chime reaching the user when the screen is dark. **Phase-change notifications remain refused** — they would violate IMMERSION_PRINCIPLES 9 ("nothing interrupts") and BACKLOG's permanent refusal of engagement notifications. This is the *only* sanctioned notification in the product.
- **No ads, no upsells, no subscriptions** — unchanged from DESIGN_PHILOSOPHY. Pricing is therefore free or one-time paid; still the owner's call.

## 7. Owner's critical path

Ranked by lead time, not importance:

1. **Enrol in the Apple Developer Program ($99/yr) — the long pole.** Identity verification can take days and every downstream step is blocked on it.
2. **Choose the build machine** — Mac, CI-only, or rented Mac (§8).
3. **Confirm the App Store name is free** (a "BIOSPHERE" collision is plausible).
4. **Confirm the music rights cover commercial distribution.**
5. **Host a privacy policy** (GitHub Pages suffices).
6. **Decide pricing.**

## 8. The build machine — CI-only, assessed

Building and submitting an iOS app requires macOS and Xcode. The owner develops on Windows, so this is a genuine blocker with three answers.

**Codemagic** is the strongest CI-only option for a solo developer: a free tier of ~500 macOS build-minutes per month, first-class Capacitor support, configuration committed to the repo as `codemagic.yaml`, and direct publishing to TestFlight and the App Store. Signing is handled by uploading an **App Store Connect API key** (Issuer ID, Key ID, `.p8`), from which the service manages certificates and provisioning profiles automatically — no manual `.p12` handling, no Xcode GUI.

**GitHub Actions** can do the same on `macos-latest` runners, but private-repo macOS minutes bill at a **10× multiplier** (2,000 included minutes ≈ 200 macOS minutes), and signing must be assembled by hand with fastlane. More control, materially more setup.

**What CI-only genuinely costs is iteration latency.** A native change becomes: push → 5–15 min build → 5–30 min TestFlight processing → install → test. That is a 20–45 minute loop where a cabled Mac would be thirty seconds.

**The honest tension:** the slow loop lands hardest on **Phase C**, which is precisely the audio-session work protecting the feature the owner values most. CI-only will reach the App Store; it will make the audio phase the most expensive part of the project. A used Mac mini (M1, ≈$400) is best understood not as a convenience but as insurance on the crown jewel.

**Regardless of route, a physical iPhone is required** — simulator audio behaviour differs from hardware, and audio is this app's soul.

## 9. Consequences for the constitution

PRODUCT_REQUIREMENTS.md was written for the artifact sandbox and has been amended alongside this document: FR-11 and NFR-5 no longer claim "no audio files" (superseded by ADR-8), NFR-3 tightens to *zero* runtime network calls, the platform constraints now describe three delivery targets, and local timer notifications leave the non-requirements list. ROADMAP.md gains milestones M6–M8 for the phases above.
