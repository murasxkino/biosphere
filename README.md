# BIOSPHERE

*One day, lived in nature.*

BIOSPHERE is not a habit tracker. It is an immersive digital environment designed to make intentional living emotionally engaging. Your day unfolds through timed **Biospheres** — Tundra, Volcanic, Seaside, Forest, Mountain — each a full-screen living landscape with its own procedurally generated soundscape. Habits rest quietly inside each biosphere. Nothing counts itself during the day. When the **Grey Night** falls, you reflect on each habit once, honestly, in a typed journal — and seal the day.

The governing principle of every decision in this codebase is **IMMERSION**.

## What it does

- A timeline home screen of animated biosphere tiles, ordered by your schedule, over a live scene of the current biosphere
- Full-screen immersion inside each biosphere; the interface dissolves after a few seconds of stillness
- Optional quiet focus timers per habit (an aid, never a scorekeeper)
- The Grey Night reflection flow — one habit at a time, yes/not-today plus a written reflection — sealed into a private journal
- A journal of past nights and a "Stillness" page of streaks and rhythm, free of gamification
- Fully editable schedule: rename, retime, re-theme, add, and remove biospheres; assign habits anywhere
- Procedural ambient audio synthesized live in the browser — nothing recorded, nothing downloaded
- Private persistence via the platform's `window.storage` key-value store

## Technical snapshot

Single-file React application (`biosphere.jsx`, ~2,000+ lines) for the Claude artifact environment. Canvas-rendered generative scenes, raw Web Audio synthesis, inline styles plus one global stylesheet, Google Fonts (Cormorant Garamond + Outfit), zero external media assets.

## Documentation

These documents are the project's constitution. Read before changing anything.

| File | Purpose |
|---|---|
| VISION.md | Why BIOSPHERE exists; the feeling being engineered |
| PRODUCT_REQUIREMENTS.md | Functional and non-functional requirements; constraints |
| FEATURE_SPEC.md | Canonical behavior of every screen and system |
| DESIGN_PHILOSOPHY.md | The values behind every decision |
| IMMERSION_PRINCIPLES.md | Operable rules that protect immersion |
| UX_GUIDELINES.md | Interaction, layout, accessibility standards |
| ART_DIRECTION.md | Palettes, typography, glass, scene bibles |
| AUDIO_ENGINE.md | The procedural sound system, scene by scene |
| ARCHITECTURE.md | System structure, state, data flow, ADRs |
| ENGINEERING_GUIDE.md | Conventions, workflows, verification, testing |
| ROADMAP.md | Milestones from here to v1.0 |
| PROJECT_STATUS.md | Live status — always current |
| TODO.md | The active work queue |
| CHANGELOG.md | Professional change history |
| BACKLOG.md | Deferred ideas and permanent refusals |
| CLAUDE.md | Operating rules for AI-assisted development |

## Status

**v0.1.0-alpha** · Milestone M0 (foundation & documentation) complete · Milestone M1 (finish core application) awaiting approval. See PROJECT_STATUS.md.

## Running it

`biosphere.jsx` is a self-contained React component with a default export. Open it as a Claude artifact (its native home), or drop it into any React sandbox — persistence gracefully falls back to in-memory storage where `window.storage` is unavailable.
