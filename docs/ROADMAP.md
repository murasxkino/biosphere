# ROADMAP

Milestones are completed one at a time; each ends with verification, self-review, documentation updates, and a stop for approval.

## M0 — Foundation & constitution ✅ (2026-07-05)
Extracted every approved decision into the documentation package; verified codebase integrity; established operating rules.

## M1 — Core application complete ✅ (2026-07-05, v0.2.0-alpha)
SettingsView, Onboarding, App root per contract; verified (parse, reference audit, SSR smoke); delivered runnable app.

## M2 — Refinement pass ✅ (2026-07-05, v0.3.0-alpha)
Owner-directed: **passage between biospheres** (countdown → portal → option to remain, FEATURE_SPEC §3.9) and the **nature-first soundscape overhaul** (AUDIO_ENGINE.md). Plus night-overlap warning, open-decision resolutions, copy pass. Runtime profiling and by-ear tuning deliberately deferred to the repo era.

## M3 — Repository migration to Claude Code ▶ next
Move the project into a real repository per **MIGRATION.md**: Vite + React + TypeScript scaffold, module split per the ARCHITECTURE map, StorageAdapter (window.storage / dev-localStorage), test suite for the time/schedule/streak core, lint/format, and a `build:artifact` target that re-emits the single-file version for Claude artifacts. Exit: behavioral parity with v0.3.0-alpha, tests green, tagged.

## M4 — QA & tuning (in the repo)
By-ear soundscape tuning per scene; device profiling of the scene loop; full manual matrix including passage flows, reduced-motion, storage-absent and no-WebAudio paths; owner playthrough findings.

## M5 — Release v1.0 (web + artifact)
Final documentation sync, version stamp, dual delivery (repo release + artifact build). The last milestone of the browser era.

## The iOS era (decided 2026-07-15 — APP_STORE_ROADMAP.md)

The goal is BIOSPHERE on the Apple App Store. Capacitor over WKWebView (ADR-9) keeps one codebase across three targets.

## M6 — Native readiness
Phase A + B: self-hosted fonts, AAC soundtrack with masters preserved, safe-area layout, durable storage, zero runtime network — then the Capacitor shell, icon, and launch screen. Exit: the app runs on a real iPhone as an installed app.

## M7 — Native platform work
Phase C: `AVAudioSession` so the soundscape survives the silent switch, background audio, interruption handling, wall-clock timer recovery, local timer-completion notifications, haptics. Exit: audio behaves correctly on hardware in every interruption case.

## M8 — App Store release
Phases D + E: store assets, privacy policy, listing, TestFlight soak, submission, review. Exit: BIOSPHERE is downloadable.

## Post-launch
Candidates graduate from BACKLOG.md only through the immersion test and explicit approval.
