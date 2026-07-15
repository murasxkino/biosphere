# AUDIO ENGINE

The procedural audio engine is a first-class feature. Every **soundscape** is synthesized live with raw Web Audio — nothing recorded, fetched, or bundled. Since M4 the app carries one sanctioned exception: the **soundtrack layer** (owner-approved, ADR-8) — one recorded musical piece per archetype, looped inside immersion. The two are independent layers under one master; everything else in this document describes the synthesized world.

## Realism principles (v0.3 overhaul)

The v0.1 soundscapes leaned on oscillators and periodic LFOs and earned the owner's critique: they sounded like instruments imitating nature. The rebuilt engine follows four rules derived from how nature actually sounds:

1. **Nature is noise, not notes.** Beds and events are filtered noise. No element holds a steady pitch except living things that truly do — crickets, and an owl.
2. **Nothing repeats on a clock.** Periodic LFOs are gone; filter cutoffs and gains wander on slow random walks (`_walk`), so no listener can find the loop.
3. **Weather moves through layers together.** Irregular coherent gusts (`_gusts`) swell several layers at once — wind body + blowing snow + whistle; canopy + leaf sizzle — the way real air does.
4. **Events have bodies.** One-shot sounds are noise grains (`_grain`): bandpass-swept bursts with real attack and decay — a chirp, a crackle, a geologic knock, a breaking wave.

## Architecture

`class AudioEngine`, one singleton `AUDIO`. Unchanged core: lazy context via `ensure()` (the autoplay seam; saved preference restored on the session's first pointerdown), gain glides via `setTargetAtTime` (volume τ 0.15 s, enable τ 0.3 s, default 0.7), scenes as `{ name, gain, stops[], timers[] }`, crossfade on `play()` (out τ 0.5 s, teardown at 1.8 s; in τ 0.9 s), cached 2 s noise buffers (white / pink via Paul Kellet filter / brown leaky integrator), scheduler `_every(minS, maxS, fn)`, random event pan `_pan`.

**Bus topology (M4):** scenes → `sceneBus` and music → `musicBus`, both into `master` → destination. `master` carries only the volume; each layer is gated by its own bus (`setEnabled` glides sceneBus, `setMusicEnabled` glides musicBus). Each bus opens to its **layer level** (`setSceneLevel`/`setMusicLevel` — the immersion hover sliders, persisted as `soundLevel`/`musicLevel`; defaults `DEFAULT_SOUND_LEVEL` 0.45 / `DEFAULT_MUSIC_LEVEL` 1 in `domain/constants.ts`), so the gates return to the listener's chosen blend, not to full. The chime connects to `master` above both gates and sounds when **either** layer is open — it is interface, not nature.

**The passage stretches the crossfade** (owner feel-check, 2026-07-13; FEATURE_SPEC §3.9): `passageOut()` on both engine and MusicPlayer begins a τ 3.5 s dusk of the living layers the moment the countdown starts — the world recedes but keeps breathing (timers stay alive); the next scene/piece then blooms in at τ 2.5 s (a one-shot `passagePending` flag, consumed on the next build); `passageCancel()` (*Remain here*) swells everything back at τ 0.8 s. Ordinary navigation keeps the standard out 0.5 / in 0.9 pace.

New helpers: `_panTo(scene, v)` fixed-position bed panning · `_walk(scene, param, base, spread, minS, maxS, τ)` random parameter walk · `_gusts(scene, targets[], gapRange, riseRange, fallRange)` coherent multi-param swells · `_grain(out, when, noiseType, {f0, f1, q, lp, hp, dur, peak})` enveloped noise event with optional bandpass sweep and looped-buffer random offset/rate · `_hoot(scene, f, peak, echoSend)` two-note owl (sine with 7 % pitch droop + parallel breath grain).

**Chime** (unchanged, deliberate): E5 → A5 sines, 1.4 s decays — the app's one intentionally musical voice. It is interface, not nature.

## Soundscape recipes (canonical, v0.3)

**Tundra** — wind body: pink → lowpass (cutoff walks 520 ± 260 Hz), panned −0.2. Blowing snow: white → bandpass Q 1.1 (walks 1500 ± 550), +0.25. Whistle: white → bandpass Q 14 (walks 1350 ± 550) that lives near silence (0.003). Gusts every 5–13 s swell all three together (body 0.16→0.4; whistle to 0.026) over 1.2–2.6 s rise, 2.6–5.5 s fall — the whistle only sings when the wind does.

**Volcanic** — tectonic floor: brown → lowpass (walks 92 ± 30 Hz) breathing 0.3→0.52 every 7–16 s. Steam: white → highpass 6.2 kHz, walked, panned right. Knocks every 9–21 s: brown grains through a resonant bandpass (52–74 Hz, Q 6, 0.4 s) — rock, not tone — 40 % with a second smaller knock. Crackle every 0.28–0.95 s (65 %): 1–4 clustered white grains, highpassed 2.6–5.2 kHz, 10–45 ms; 22 % are deeper lowpassed pops.

**Seaside** — constant distant surf: pink → lowpass (walks 320 ± 110), gain walked around 0.1; sea air: white → highpass 7 kHz, walked. **Wave events** every 6–12 s, alternating sides (pan ±0.15–0.4): a white-noise body whose cutoff climbs 240→1500 Hz over a 2–3.8 s gather while gain rises, then a highpassed (1.7 kHz) foam burst at the break that hisses down through a 3–6.5 s wash as the body falls back — each wave a different size (k 0.55–1). A far gull cries twice every 22–48 s (60 %): bandpass-swept grains 2.9→2.0 kHz.

**Forest** — floor hush: brown → lowpass 220. Canopy: pink → bandpass (walks 1700 ± 700), panned −0.15, with a leaf-sizzle layer (white → highpass 3.2 kHz, +0.2) that rises only in gusts (every 6–14 s). **Birdsong is noise-born**: phrases every 4–10 s from two species — a low caroler (2.5–3.4 kHz, 2–4 down-chirps, Q 16 sweeps ×1.28→×0.8) and a fast twitterer (3.7–4.6 kHz, 4–7 alternating up/down 50 ms chirps) — each phrase randomly panned, with a quieter lowpassed **distant** singer every 8–19 s for depth.

**Mountain** — the drone and pentatonic bells are gone. Thin air over stone: pink → bandpass (walks 750 ± 300), −0.15; altitude sizzle: white → highpass 4 kHz, +0.2; long alpine gusts (8–18 s apart, 2–4 s rise, 4–8 s fall). A feedback delay (0.58 s, fb 0.42, damped 1.1 kHz, wet 0.45) remains as the **valley echo**, fed only by an owl that calls every 24–55 s (350 Hz region, two hoots with breath).

**Grey Night** — the 52 Hz sine floor and 311 Hz tone are gone. The dark: brown → lowpass 130, gain walked. Night breeze: pink → bandpass (walks 600 ± 240) with rare soft gusts. **Cricket chorus**: two continuous trill voices — white noise through Q 26 bandpasses at 4.3 / 4.65 kHz, amplitude-modulated at 31 / 26 Hz (crickets genuinely trill near-sinusoidally), panned ±0.25/−0.3 — plus a nearer cricket calling three-pip phrases every 1.1–2.6 s. A distant owl (300 Hz region, no echo) every 40–90 s.

Loudness discipline: beds sum ≤ ~0.45; events ≤ 0.05 except waves and knocks; everything mixed to sit behind thought.

## The soundtrack layer (M4, ADR-8)

`class MusicPlayer` (`src/audio/music.ts`), one singleton `MUSIC`, sharing the engine's context through `musicBus`. One recorded piece per archetype, declared in the manifest `src/audio/tracks.ts`; files live in `public/music/` (served in dev, copied into web builds, absent from the artifact — detected by the `window.storage` signal, so the toggle never renders there).

- **Playback**: fetch + `decodeAudioData` on first entry into a scored world; decoded buffers cached, at most two (current + previous). Track gain fades in like a scene (τ 0.9 s), out on leave (τ 0.5 s, teardown 1.8 s).
- **The loop**: the pieces are not authored as perfect loops, so each pass is joined to the next by an **equal-power crossfade** over a seam of `min(3 s, duration/8)`. One future pass is always pre-scheduled, and the chain advances on the audio clock itself (`onended`), never a JS timer — background-tab throttling cannot misalign a join.
- **Independence**: `musicPref` persists beside `soundPref` (absent = on); either layer plays without the other; master volume governs both.
- **Failure is silent**: a missing or unfetchable track leaves the world unscored (retry by toggling); no toast, no console noise — the storage-fallback precedent.

**Swapping a track** (the owner's knob): drop the new file in `public/music/`, point the archetype's entry in `src/audio/tracks.ts` at it, and bump the `?v=` query so cached listeners hear the new piece. `null` = unscored (no toggle shown). Prefer lossless WAV/FLAC, loop-authored, 1–5 min. Each entry's **`level`** is the piece's by-ear trim against the scene's beds — the M4 tuning knob (first-pass 0.4 everywhere until the listening session says otherwise).

## Known state & tuning

**The M4 by-ear session happened 2026-07-12/13, owner listening live.** Outcomes, now the canonical values in `engine.ts`:

- **Tundra, Mountain, Grey Night** — approved exactly as first-passed; no changes.
- **Volcanic** — the sizzle sat too hot: steam-vent walk base 0.006→0.004 (spread →0.0025); highpassed crackle grains →0.004–0.013 peaks. Knocks and low pops untouched.
- **Forest** — the birds sang too shyly: near phrases →0.028–0.046 peaks, the distant singer →0.01.
- **Seaside** — resolved with no recipe change: the owner set their global layer blend via the immersion sliders instead. That blend (ambience 0.45, music 1.0) **became the shipped default** on 2026-07-14 (`domain/constants.ts`).
- **Soundtrack trims** — all five pieces remain at manifest `level` 0.4 under the owner's slider blend.
- **The passage** — reworked mid-session to lead with the ear (dusk τ 3.5 s from the chime, bloom τ 2.5 s in, swell-back τ 0.8 s); approved on the second staged crossing.

Still open by ear: the *Remain here* swell-back has not been heard live (staged crossings auto-completed) — spot-check it during the manual matrix.

## ADR: raw Web Audio over Tone.js (upheld)

The overhaul strengthened the original decision: random-walked params, grain scheduling, and precise crossfade teardown are exactly the low-level control raw nodes give cheaply (~450 lines, zero dependencies).
