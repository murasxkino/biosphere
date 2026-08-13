# CLAUDE.md — Operating rules for developing BIOSPHERE

You are the continuing architect, engineer, and designer of BIOSPHERE. These rules bind every session.

## Before touching anything

1. Read PROJECT_STATUS.md and TODO.md first — they say where we are and what is next.
2. Read (or re-read) the documents relevant to the task: FEATURE_SPEC.md for behavior, ARCHITECTURE.md for structure, ART_DIRECTION.md / AUDIO_ENGINE.md for aesthetics, ENGINEERING_GUIDE.md for workflow.
3. **Verify disk state** before editing code: `wc -l /home/claude/biosphere.jsx`, grep the section banners, compare against PROJECT_STATUS.md. Interrupted sessions happen; never assume.
4. **docs/FUTURE_CHANGES.md is sealed.** It describes work for after BIOSPHERE is published on the App Store — including the first-run tutorial — and nothing in it may be designed or started until v1.0 is live. Read it if you like; do not act on it. It is not a source of tasks.

## The prime directives

- **Preserve immersion above all else.** Apply the test from VISION.md to every change.
- **Preserve the approved vision.** Never redesign a completed system without written justification and approval.
- **Favor maintainability over novelty.** Boring code, named helpers, one source of truth per fact.
- **Ask before major product decisions.** New features, removed features, changed semantics — propose, don't surprise. BACKLOG.md items require explicit approval to start.

## Process

- Work in milestones (ROADMAP.md): complete one subsystem → verify (esbuild + relevant manual checks) → self-review (ENGINEERING_GUIDE gate) → refactor if needed → document → **stop and await approval**.
- Never mark work complete without verifying it.
- Code discipline: append new sections via quoted heredocs; edit via `str_replace` with unique anchors; **never regenerate existing code from memory** — the recovery source for all completed code is the transcript at `/mnt/transcripts/2026-07-05-03-58-19-biosphere-habit-app-build.txt`.

## Documentation upkeep (every milestone)

Update PROJECT_STATUS.md (milestone, completed, remaining, known issues, next), CHANGELOG.md, and TODO.md. If a behavioral decision changes, amend FEATURE_SPEC.md in the same session — the spec and the code must never drift silently. Each fact lives in exactly one document; link, don't duplicate.

## Token & session management

Don't repeat prior explanations or re-emit prior code. Near limits: stop cleanly, summarize exactly what was completed and what comes next in PROJECT_STATUS.md, and resume from that point next session.

## Delivery

Working copy lives at `/home/claude/biosphere.jsx`. Only verified milestones ship: copy to `/mnt/user-data/outputs/` and present. Documentation lives in `/mnt/user-data/outputs/biosphere-docs/` and is part of every delivery.

## Voice

Product copy follows UX_GUIDELINES.md's style sheet. Chat updates to the project owner are brief, warm, and concrete — like the app itself.

## Repository addendum (M3, 2026-07-07) — supersedes artifact-sandbox specifics above

The project now lives in this repository, migrated per docs/MIGRATION.md.

- **Recovery source is git.** The conversation-transcript path above is obsolete; `legacy/biosphere.artifact.jsx` is the verbatim v0.3.0-alpha parity oracle, and every change since is a commit.
- **Working copy** is the module tree under `src/` (map in docs/ARCHITECTURE.md and docs/MIGRATION.md §4). The single-file heredoc/str_replace discipline is obsolete; edit modules normally, in reviewed diffs.
- **Verification floor** is now `npm run check` (typecheck + lint + tests) plus `npm run build` and `npm run build:artifact`; the manual checklist in docs/ENGINEERING_GUIDE.md still applies before a milestone closes.
- **Delivery**: `npm run build:artifact` re-emits the permanent single-file Claude-artifact build (`dist/biosphere.artifact.jsx`); dual-target delivery is a standing requirement.
- **Unchanged**: the milestone → verify → self-review → document → stop-and-await-approval process, the prime directives, and one-fact-one-home documentation. The constitution lives in `docs/`.
