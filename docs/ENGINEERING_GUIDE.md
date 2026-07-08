# ENGINEERING GUIDE

## Code conventions

- Plain, boring JavaScript: double quotes, string concatenation over template literals in JSX-adjacent code, `const` everywhere, no clever one-liners. If an expression needs a comment to parse, extract a named helper (see `stateOf` in HomeView — the precedent).
- Section banners (`/* ===== */`) delimit the module map in ARCHITECTURE.md; keep them accurate.
- Components are function declarations; hooks at top; derived values next; handlers next; JSX last.
- Naming: singletons UPPER (`ARCH`, `AUDIO`, `STYLE`); components PascalCase; utilities terse camelCase (`t2m`, `msFmt`).
- One source of truth per fact — in code *and* docs. Palettes live in `ARCH`; recipes in the engine; never re-declare.

## Working on the file (single-file discipline)

1. **Verify before touching**: `wc -l biosphere.jsx` and grep the section banners; confirm counts match PROJECT_STATUS.md.
2. **New sections** append via `cat >> … << 'BIOEOF'` heredocs (quoted delimiter — no shell interpolation).
3. **Edits** use targeted `str_replace` with unique anchors; re-view before repeated edits to the same region.
4. **Never regenerate existing code.** Recovery source, if the working copy is ever lost: the conversation transcript (path in CLAUDE.md).

## Verification (required before any milestone closes)

```
npx -y esbuild biosphere.jsx --loader:.jsx=jsx --outfile=/tmp/bio_check.js && echo PARSE_OK
```

Parse-clean is the floor, not the bar — follow with the manual checklist.

## Manual test checklist

**Boot**: splash ≥ 1.1 s → onboarding (first run) → Enter with sound pill on/off. **Home**: correct NOW biosphere for the clock; pre-dawn shows *Before the day*; tiles past/now/next correct; all four header buttons route. **Immersion**: enter animation; UI dissolves at ~6.5 s, returns on touch; timer start/cancel/complete (chime, `COMPLETE ✦`); back. **Night**: intro count; Continue gating; Back preserves answers; seal → toast, home tile reads *reflected — X of Y*; reopen sealed; Amend. **Journal/Stillness**: entries render; streak math sane after two sealed days. **Settings**: every field edits live; last-biosphere delete blocked; delete-with-habits reassigns + toast; add bio/habit; night time change reorders the tile; two-step reset lands on onboarding. **Sound**: toggle everywhere; crossfade on scene change; volume slider; reload restores sound on first tap. **A11y**: keyboard-activate a tile; visible focus ring; OS reduced-motion → stills.

**Simulating times**: temporarily edit biosphere `start` values / `nightStart` in Settings rather than touching code; 4 AM rollover is testable by setting nightStart near now and reflecting after midnight.

## Performance budgets

DPR cap 2; one rAF per mounted canvas (≤ 1 visible at a time by design); particle ceilings per scene as in ART_DIRECTION.md (~≤ 150 draw entities); `dt` clamped to 50 ms; no per-frame array allocation in particle loops (gradients per frame are accepted — measured cheap at these counts). Audio: ≤ ~12 persistent nodes per scene; noise buffers cached once.

## Storage discipline

Keys are versioned (`-v1`). Schema changes → new key + one-time migration read; never mutate the meaning of an existing key. All reads tolerate `null`/malformed values by falling back to defaults. Journal writes are immediate; config writes debounced — keep it that way (data loss on tab close is acceptable for a half-typed setting, not for a sealed day).

## Self-review gate (before marking any milestone complete)

Inspect for: duplicated logic, unnecessary complexity, architectural drift from ARCHITECTURE.md, per-frame hot-path waste, accessibility regressions, unhandled edge cases (empty bios/habits, deleted-habit journal entries, malformed times), and copy drifting from FEATURE_SPEC §4/UX voice. Refactor before continuing; log outcomes in PROJECT_STATUS.md.
