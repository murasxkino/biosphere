# ARCHITECTURE

## Context & constraints

One React file (`biosphere.jsx`), default-exported `App`, running in the Claude artifact sandbox: React is the only import; persistence is the async `window.storage` KV API (no `localStorage`); styling is inline + one injected stylesheet; fonts via CDN. These constraints are binding (PRODUCT_REQUIREMENTS.md) and shape everything below.

## Module map (logical sections within the file, top → bottom)

1. **Constants** — `ARCH` (archetype identities), `ARCH_KEYS`, defaults (`DEFAULT_BIOS`, `DEFAULT_HABITS`, `DEFAULT_NIGHT_START`), storage keys.
2. **Utils** — pure functions only: time (`t2m`, `fmtTime`, `dayKey` 4 AM rollover, `prevKey`, `fmtDayKey`, `msFmt`), stats (`lastNDays`, `habitSeries`, `calcStreak`, `calcBest`), `uid`.
3. **Store** — `store.get/set`: JSON over `window.storage`, try/caught, in-memory fallback map.
4. **AudioEngine** + `AUDIO` singleton (AUDIO_ENGINE.md); beside it the M4 soundtrack layer — `MusicPlayer` + `MUSIC` singleton (`audio/music.ts`) and the track manifest (`audio/tracks.ts`), playing recorded pieces through the engine's music bus (ADR-8).
5. **Scenes** — `vgrad/vignette/ridge` helpers, `makeScene(kind)` factories, `SceneCanvas` (rAF loop, DPR ≤ 2, ResizeObserver, reduced-motion → single still frame, draw try/caught).
6. **UI kit** — `Ic` icon set, `STYLE` global CSS, `glassCard`, `Pill`, `SectionLabel`, `Shell`, `ToastBar`, `Splash`.
7. **Views** — `BioTile`+`HomeView`, `ImmersionView`, `NightView`, `JournalView`, `StatsView`, `SettingsView`, `Onboard`.
8. **App root** — state, effects, routing (contract below).

Dependency direction is strictly downward; views never touch `store` or `AUDIO` state directly except via props/callbacks (`AUDIO.chime()` inside ImmersionView is the one sanctioned direct call).

## State ownership

| State | Owner | Persistence |
|---|---|---|
| `bios`, `habits`, `nightStart`, `volume`, `soundOn`(→`soundPref`), `musicOn`(→`musicPref`), `onboarded` | App | config key, debounced 700 ms |
| `journal` | App | journal key, immediately on seal |
| `view` `{name,id?}`, `phase` boot/onboard/app, `now`, `toast`, `pendingSound` | App | session only |
| UI fade, timers (`runs`/`doneT`), night `ans`/`step`/`mode`, journal `open` | owning view | ephemeral by design |

Derived, memoized in App: `sorted` (bios by start), `sched` = `{ currentId, endOf(id) }` per FEATURE_SPEC §2, `currentArch`, `desiredArch` (immersion bio's archetype / `night` / current).

## Data flow

```
clock (20 s) ─┐
storage load ─┼→ App state → props → Views ─(callbacks: onOpen/onSeal/onToggleSound/setters)→ App
              └→ sched memo → currentArch/desiredArch → AUDIO.play (crossfade) & Home scene
NightView.finalize → onSeal(entries) → journal state + immediate store.set → toast
Settings setters → state → debounced store.set(config)
```

## App-root contract (canonical for Milestone M1)

States: `phase`, `view`, `bios`, `habits`, `nightStart`, `journal`, `soundOn`, `volume` (0.7), `now`, `toast`, `pendingSound`.

Effects & handlers, exactly:
1. **Load** (mount): `Promise.all([store.get(CONFIG_KEY), store.get(JOURNAL_KEY), delay 1100 ms])`; hydrate or defaults; `soundPref` → `pendingSound`; `phase` = `onboarded ? "app" : "onboard"`.
2. **Save config**: debounce 700 ms on `[bios, habits, nightStart, volume, soundOn]`, gated `loaded && phase==="app"`; writes `{onboarded:true, …, soundPref: soundOn}`.
3. **Clock**: `setInterval(setNow, 20 000)`.
4. **Audio scene**: on `desiredArch` change → `archRef.current = desiredArch; AUDIO.play(desiredArch)`.
5. **Volume**: `AUDIO.setVolume(volume)`.
6. **Unmount**: `AUDIO.stop()` + `MUSIC.stop()`.
6a. **Soundtrack** (M4): `AUDIO.setMusicEnabled(musicOn)` on change; `musicArch` (the immersion bio's archetype, else null) drives `MUSIC.play(musicArch)` / `MUSIC.stop()`; `toggleMusic` mirrors `toggleSound` (supported-guard + toast, ensure inside the gesture).
7. **Pending sound**: one-time `pointerdown` → enable + play `archRef.current`, clear flag.
8. **Phase announce**: track `prevCurrentId` in a ref (null-initialized; first pass records only); on change while `phase==="app"` → toast *{name} begins* + `AUDIO.chime()`.
9. `toggleSound` (guards `AUDIO.supported()`, toasts if not), `sealDay(entries)` (write journal + immediate persist + toast), `enterApp(withSound)` (from Onboard, starts audio inside the gesture), `doReset` (defaults, persist `{onboarded:false}` + `{}`, silence, `phase="onboard"`, toast), `say(msg)` (2.6 s single-toast helper with timeout ref).

Routing: an if/else chain builds `body` (never `setState` in render); `immersion` with a missing bio id falls back to Home. Render: `<style>{STYLE}</style>` + Splash/Onboard/body + optional ToastBar.

## Error & resilience strategy

Storage: every call try/caught; memory fallback keeps the session coherent. Scenes: each frame draw try/caught (a bad frame is dropped, never fatal). Audio: capability-gated; teardown closures individually try/caught. Time inputs: `t2m` tolerates malformed strings (→ 0).

## Architecture decision records

- **ADR-1 Single file.** Platform requirement; mitigated by strict section discipline and this map. A future repo split falls out 1:1: `constants.ts / time.ts / stats.ts / store.ts / audio/ / scenes/ / ui/ / views/ / App.tsx`.
- **ADR-2 `window.storage` + memory fallback** over localStorage (forbidden) — async, try/caught, versioned keys (`-v1`); migrations = read old key, write new.
- **ADR-3 Raw Web Audio** over Tone.js — see AUDIO_ENGINE.md.
- **ADR-4 Canvas scenes** over DOM/CSS particles — hundreds of elements at 60 fps need one draw surface; DOM reserved for UI.
- **ADR-5 Inline styles + one stylesheet** — Tailwind arbitrary values unavailable; a tokens-in-JS approach (`ARCH`, `glassCard`) keeps theming programmatic.
- **ADR-6 4 AM day rollover** — matches lived days; a midnight reflection belongs to the evening it ends.
- **ADR-7 No router / no state library** — one object of view state; the app is a shallow star around Home.
- **ADR-8 Recorded music assets (M4, owner-approved 2026-07-12)** — the soundtrack layer is the one sanctioned exception to "zero assets, procedural everything": one recorded piece per archetype in `public/music/`, manifest-declared, played through a dedicated engine bus only inside immersion. Soundscapes and scenes remain 100 % procedural forever. Artifact builds cannot carry the files, so the layer is absent there (dual-target divergence, accepted by the owner); the `build:artifact` requirement stands unchanged.

## Future path (out of v1 scope)

Native/PWA packaging and push notifications require leaving the artifact sandbox; the documented route is a repo migration developed with Claude Code. Nothing in v1 may take a dependency that blocks that split.
