# UX GUIDELINES

## Navigation model

```
Splash → (first run) Onboarding → Home
Home ⇄ Immersion(biosphere)      one tap in, back out
Home ⇄ Grey Night                the night flow / sealed review
Home ⇄ Journal · Stillness · Settings   (Shell pages)
```

Home is the only hub. Every other view exits via a single back button, always top-left, always 40×40. There is no tab bar, hamburger, or breadcrumb. View state is a plain object (`{name, id?}`) — no router.

## Layout

Single column, max-width 560 px, centered; content padding 20–24 px; generous bottom padding (60–72 px) so nothing hides behind device chrome. Phone-first: everything must read in one hand. Rows in Settings may wrap (`flexWrap`) rather than shrink inputs below usability.

## Touch & input

- Minimum interactive size 40 px; tiles are full-width targets.
- Tiles and collapsible headers are keyboard-real: `role="button"`, `tabIndex=0`, Enter/Space activation.
- Inside immersion, taps both wake the UI and (on a timed habit) toggle its timer; habit taps `stopPropagation` so they don't double-fire the wake.
- Inputs use the shared `.bsInput`/`.bsSelect` classes; time and number inputs opt into dark `color-scheme`. Font size ≥ 16 px in inputs to prevent mobile zoom.

## The night flow cadence

One habit per screen. One question. Two pills. One optional textarea. Continue stays disabled until Yes/Not-today is chosen; Back never loses answers. Progress is dots, not "3/7 complete" — countable but unpressured.

## Feedback

Toasts only (see IMMERSION_PRINCIPLES 9). Destructive actions use inline two-step confirmation on the same button (label changes to *Tap again to confirm*), never a dialog. Disabled buttons dim to 0.35 — visibly present, clearly inert.

## Accessibility

- `prefers-reduced-motion: reduce` → canvases render one still frame; all CSS animation/transition collapse to ~0 ms (global media rule). The app remains fully usable as a sequence of beautiful stills.
- `:focus-visible` outline (2 px, offset 2) on every interactive element; never removed.
- All icon-only buttons carry `title` + `aria-label`; decorative SVGs are `aria-hidden`.
- Text contrast: primary text ≥ #f2f4f7 on veils darkened to at least rgba(4,7,11,0.44); letterspaced caps never below 11 px; muted copy floors at 0.45 alpha over dark veils.
- Timers and phase changes are visible states, not sound-only signals (chime is reinforcement, not the message).

## Empty & error tone

Empty states: serif italic, warm, ≤ 2 lines, always naming the gentle next step. Errors are rare and factual (*Audio isn't available in this browser*); storage failure is silent by design — the session simply lives in memory.

## Copy style sheet

Wayfinding: UPPERCASE, 0.18–0.34 em tracking, 11–12 px. Titles: Cormorant Garamond 500, often italic. Body: Outfit 300, 15 px, line-height ≥ 1.55. The word "biosphere" is lowercase mid-sentence; named biospheres and Grey Night are capitalized. The ✦ glyph is reserved for sealing/completion moments only.
