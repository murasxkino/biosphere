# TODO

## Milestone M2 — ✅ shipped 2026-07-05 (v0.3.0-alpha)

Owner critiques delivered: automatic **passage between biospheres** (10 s countdown, portal crossing, Remain here — FEATURE_SPEC §3.9) and the **nature-first soundscape overhaul** (AUDIO_ENGINE.md). Also shipped: Grey Night overlap warning; deleted-habit stats decision (journal-only, by design); copy pass (clean); mobile input sizing confirmed.

## Milestone M3 — Repository migration to Claude Code — ✅ shipped 2026-07-12 (v0.3.0)

- [x] Owner: open Claude Code in the handoff folder; repo initialized in place (git history begins at the verbatim handoff).
- [x] Bootstrap per MIGRATION.md: Vite + React 18 + TypeScript strict, ESLint + Prettier, Vitest + Testing Library, CI workflow.
- [x] Split the single file per the ARCHITECTURE module map; `legacy/biosphere.artifact.jsx` kept as the parity reference.
- [x] Introduce `StorageAdapter` (window.storage for artifact builds; localStorage for local dev; memory fallback).
- [x] Tests for the correctness core — 74 green: `dayKey` 4 AM rollover, schedule resolution (pre-dawn, boundaries, night-overlap), `calcStreak`/`calcBest`/`habitSeries` incl. deleted-habit entries; AudioEngine graph construction against a mock AudioContext; boot render test replacing smoke.cjs; per-view render tests.
- [x] Add `build:artifact` single-file bundle target (with built-in SSR boot smoke) for shipping back to Claude artifacts.
- [x] **Owner:** manual parity pass against v0.3.0-alpha (ENGINEERING_GUIDE checklist) via `npm run dev` — approved 2026-07-12; `v0.3.0` tagged.
- [x] Connect a GitHub remote — done 2026-07-12: private `murasxkino/biosphere` via `gh repo create`; CI activated on first push and ran green. _(License: proprietary, all rights reserved — see `LICENSE`.)_
- [x] M4-entry chore: first `npm run format` (2026-07-12) — `src/`, root markdown & html; `legacy/` and `docs/` excluded by `.prettierignore`. Check + builds green after.

## Milestone M4 — QA, tuning & the soundtrack layer (post-migration)

- [x] **Soundtrack layer** (owner-approved 2026-07-12; FEATURE_SPEC §3.10, ADR-8): engine buses, MusicPlayer with audio-clock seam crossfade, manifest, immersion + Settings toggles, `musicPref`, artifact absence, 18 new tests. Tundra & forest tracks landed.
- [x] Owner: deliver volcanic, seaside, mountain tracks — landed 2026-07-12; all five worlds scored. Manifest gained the per-track `level` trim (first-pass 0.4 everywhere).
- [x] By-ear tuning session, all six worlds + passage (2026-07-12/13, owner live) — outcomes canonical in AUDIO_ENGINE § Known state & tuning: tundra/mountain/night as-is, volcanic sizzle trimmed, forest birds lifted, seaside via the owner's slider blend, passage reworked to dusk-and-bloom. Closed 2026-08-08: the *Remain here* swell-back was heard on a staged boundary and approved — no part of the audio system is unheard now. The default-blend decision closed 2026-07-14: the owner's blend (0.45/1.0) is the shipped default.
- [x] Layer level sliders (owner-requested mid-session, 2026-07-12): hover-revealed vertical sliders under the immersion toggles; persisted `soundLevel`/`musicLevel`; FEATURE_SPEC §3.10.
- [x] Passage feel check (2026-07-13): two staged crossings — countdown pacing and veil approved; transition audio reworked on the owner's note (dusk from the chime, slow bloom in — FEATURE_SPEC §3.9) and approved on the re-listen. Remaining cancel-path spot-check (*Remain here* swell-back) folds into the manual matrix below.
- [ ] Device profiling of the scene loop; adjust particle ceilings if needed.
- [x] Manual matrix — **browser-testable half done 2026-08-08** (results in PROJECT_STATUS): reduced-motion (rAF loop never starts; CSS collapse rule present), storage-absent (all backends broken → session stays coherent in memory, app keeps rendering), no-WebAudio (every entry point no-ops, toast shown), scored vs unscored worlds (no dead soundtrack control in Grey Night), and all four ambience×soundtrack combinations. Zero console errors throughout.
- [ ] Manual matrix — **device half**, needs the iPhone: OS-level reduced-motion, the silent switch, backgrounding and interruptions, `-webkit-touch-callout` (a WebKit property Chrome does not implement), real-hardware scroll and tap feel.
- [ ] Fold in owner playthrough findings.

## Milestone M7 — native platform work

- [x] Native bridge, timer-completion notification (scheduled on start), haptics on timer close and seal — written and tested 2026-08-08 (FEATURE_SPEC §3.11). Behaviour on a device is unverified until the Mac.
- [ ] `AVAudioSession` playback category (survive the silent switch), background audio, interruption handling — needs Xcode and `ios/`.
- [ ] `npm run ios:add`, then the first real build and TestFlight — **follow MAC_SETUP.md**, written ahead of the move so day one is spent building.
- [ ] Device leg of the manual matrix (see PROJECT_STATUS) and scene-loop profiling on hardware.
- [x] Privacy policy and store listing copy drafted 2026-08-13 — PRIVACY_POLICY.md and STORE_LISTING.md. Four owner decisions still open at the foot of STORE_LISTING (public support email, price, name availability, effective date).
- [ ] Screenshots — need a real device; the five shots and capture conditions are specified in STORE_LISTING.
- [ ] Publish the privacy policy at a public URL (GitHub Pages will not serve a private repo on a free plan — use a separate public repo or a static host; do **not** make the app repo public).

## Parking

See BACKLOG.md — nothing there starts without an explicit go.
