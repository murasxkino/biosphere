# ART DIRECTION

The single source of truth for color, type, surface, and the composition of each living scene.

## Typography

| Role | Face | Notes |
|---|---|---|
| Display / human voice | Cormorant Garamond 400–600, italics beloved | Titles, dates, taglines, reflections |
| Interface / wayfinding | Outfit 200–500 | Body 300; labels letterspaced caps |
| Wordmark | Outfit 300, 0.42 em tracking | `BIOSPHERE`; splash variant 200 @ 0.5 em |

Both families are SIL Open Font License 1.1 and bundled with the app; the licence texts ship beside the `woff2` files in `public/fonts/`, as the OFL requires. Provenance and terms for every third-party asset: `THIRD_PARTY_NOTICES.md`.

Base text `#f2f4f7` on near-black `#05070b`. Muted tiers: 0.78 / 0.6–0.65 / 0.45–0.55 alpha white.

## Archetype palettes

| Archetype | Accent | Soft | Glow (rgba) | Tile gradient (178°) |
|---|---|---|---|---|
| Tundra | `#9fd8e8` | `#e6f6fa` | 140,214,232,.5 | `#0a141d → #123040 → #28505f` |
| Volcanic | `#ff9d6f` | `#ffe3d1` | 255,122,66,.45 | `#0c0507 → #230a0c → #3d1410` |
| Seaside | `#a5dee6` | `#eafbfd` | 150,220,230,.45 | `#16333f → #3f7186 → #0e2a35` |
| Forest | `#b9e39a` | `#eef9df` | 170,224,140,.4 | `#09140c → #173822 → #0e2415` |
| Mountain | `#cfc0f2` | `#f1ecfd` | 190,170,240,.4 | `#151027 → #2c2150 → #4a3670` |
| Grey Night | `#a9b4cd` | `#e9edf6` | 160,175,205,.35 | `#07090f → #10151f → #1a2230` |

Accents color: NOW indicators, eyebrows, archetype glyphs, progress fills, night pills. Never large fills.

## Surfaces — the glass language

Glass card: `rgba(10,15,22,0.5)`, 1 px border `rgba(255,255,255,0.1)`, radius 18, blur 14. Icon buttons: white 0.07 fill / 0.13 border, radius 14, blur 10. Pills: radius 999, white 0.05/0.2; selected = solid accent with ink `#0b1016` text. Primary button: near-white `rgba(240,244,248,0.92)` on ink. Veils: home gradient rgba(4,7,11) 0.68→0.44→0.72; Shell pages flat 0.78; immersion only a radial edge shade (world stays bright).

## Iconography

Inline SVG, 24-grid, 1.5 px stroke, round caps/joins, `currentColor`. Set: back, chev, sound, mute, gear, book, sprout, plus, trash, clock, x, moon, snow, volcano, wave, tree, peaks. Line-drawn and unfilled except tiny volcanic spark dots.

## Scene bibles (canvas, per archetype)

Shared grammar: vertical gradient sky → distant light event → layered `ridge()` silhouettes (3-octave sine terrain) → drifting atmosphere → foreground particles → `vignette()` (radial + bottom shade) to seat UI text. Tempos are glacial: ambient cycles 8–40 s; particle drift 5–30 px/s.

- **Tundra** — glacial blues; two aurora ribbons (green, blue) undulating at ~0.1 Hz; twin ice ridges; a sheen that sweeps the ice perhaps once a minute; 96 snowflakes in three parallax layers with sinusoidal sway.
- **Volcanic** — charred reds; magma glow breathing from below the horizon (two-sine pulse); two black ridges; 5 slow-rising smoke wisps; 56 embers rising with flicker, warming from `#ff8a4d` to `#ffd28a` at peak.
- **Seaside** — dusk teals with a warm low sun at x 0.64; drifting cloud banks; 3 distant flapping birds; 26 sun-glint bars shimmering down the water; 3 alternating swell bands with white crest lines; 40 foam sparkles.
- **Forest** — deep greens; central glade light; 4 swaying god-ray shafts; dark canopy corners and 4 framing trunks; 7 tumbling leaves; 55 rising pollen motes twinkling.
- **Mountain** — violet dusk; 90 early stars; a small bright moon with halo at (0.72, 0.20); three ridge lines with two horizontal mist banks breathing between them.
- **Grey Night** — near-black slate; 140 stars (6 % with cross-sparkle); crescent moon with halo; thin drifting clouds; a shooting star every ~16–42 s; one low black ridge.

## Signature element

The pairing of **living scenes** with **dissolving chrome** is BIOSPHERE's visual signature. Any new view must choose its backdrop from these six worlds; no flat backgrounds may be introduced.
