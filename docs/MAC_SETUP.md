# MAC SETUP — day one on the build machine

Everything the first macOS session needs, so it can be spent building rather than orienting. Written on Windows ahead of the move; nothing here has been executed yet, so treat each step as *verify, then proceed* rather than *assume it worked*.

Read **CLAUDE.md** first (it is the operating contract, and it binds on any machine), then **PROJECT_STATUS.md** for where the project actually is. This file only covers the platform move.

## 0. What the machine is for

Everything up to here has been done on Windows: the app, the tests, the Capacitor configuration, the icon, the notification and haptics bridge. The Mac exists to do the five things Windows cannot — generate the native iOS project, compile it, sign it, run it on a real iPhone, and submit it.

## 1. Install

| What | How | Notes |
|---|---|---|
| **Xcode** | Mac App Store | Launch it once and accept the licence, or every CLI step fails with a confusing error. |
| **iOS platform** | `xcodebuild -downloadPlatform iOS` | **Xcode no longer ships it.** Several GB, and nothing — not even a device build — will compile without it: destinations come back "iOS *n* is not installed". Start it early; it is the longest single wait of the day. |
| **Command Line Tools** | `xcode-select --install` | Installing them *repoints* `xcode-select` at the CLT. Put it back, or every native step fails: `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`. |
| **Node 22** | `brew install node@22` | Match CI (`.github/workflows/ci.yml`), do not just take "current". `engines` says ≥ 20, but on **Node 26 eighteen tests fail** — it ships an experimental global `localStorage` that returns `undefined` without `--localstorage-file` and shadows jsdom's real one. The app is fine; the toolchain is too new. node@22 is keg-only, so put `/opt/homebrew/opt/node@22/bin` first in `PATH`. |
| **Claude Code** | `npm install -g @anthropic-ai/claude-code` | |
| **GitHub CLI** | `brew install gh`, then `gh auth login` | Same account as the Windows machine: **murasxkino**. |

**CocoaPods is not needed.** Capacitor 8 links native plugins through Swift Package Manager: there is no `Podfile` and no `.xcworkspace`. (If you ever do need it, `brew install cocoapods` — macOS system Ruby is 2.6 and far too old for `sudo gem install cocoapods`.)

On a **MacBook Neo (8 GB, not upgradeable)**: do not run Xcode, the iOS Simulator, a Vite dev server, and a browser at once. Most of our work uses a physical iPhone rather than the Simulator, which is the heaviest of those — prefer the device.

## 2. Get the project running before touching anything native

```
gh repo clone murasxkino/biosphere
cd biosphere
npm install
npm run check        # expect: typecheck clean, 1 known lint warning, 119 tests green
npm run build
npm run build:artifact   # expect: ARTIFACT_SMOKE_OK
```

If those pass, the move is clean and any later failure belongs to the native layer rather than the port. Do not skip this — it is the only cheap way to tell the two apart.

## 3. Generate the iOS project

```
npm run ios:add      # cap add ios — needs macOS; this is why the Mac exists
npm run ios:sync     # builds the web app and copies it into ios/
npm run ios:open     # opens App.xcodeproj in Xcode
```

Capacitor 8 uses Swift Package Manager, so what opens is a **project, not a workspace**, and the plugins arrive as resolved packages (`capacitor-swift-pm`) rather than pods.

`ios/` is generated, arrives with its own `.gitignore`, and **should be committed** — Capacitor treats it as project source, and it is where the native configuration below lives.

Sanity check before going further: `ios/App/App/public/` should contain the built web app including `music/*.m4a` (~8.4 MB) and `fonts/*.woff2`. If the audio is missing, the app will run silent on device and the cause will not be obvious.

## 4. The native work (M7)

### 4a. Audio session — the release blocker

Left unconfigured, **the ring/silent switch mutes the entire app**. For an ambient app that is fatal, and it is the single most important thing to fix on day one.

The app needs the `playback` category, which declares the audio as intentional content rather than an alert, and it needs the `audio` background mode so a soundscape and a focus timer survive the screen locking.

- `UIBackgroundModes: [audio]` in `Info.plist`. Xcode writes it for you via target **App** → *Signing & Capabilities* → **+ Capability** → **Background Modes** → **Audio, AirPlay, and Picture in Picture**; editing the plist directly does the same thing and arrives as a reviewable diff instead of a click.
- Setting the `AVAudioSession` category itself has no first-party Capacitor plugin. Two routes: a community plugin, or a small Swift addition to `AppDelegate.swift`. **Prefer the Swift shim** — it is smaller than a dependency, does exactly one thing, and cannot rot.
- **Set the category, but do not activate the session at launch** (decided 2026-08-16). This corrects the original instruction to call `setActive(true)` alongside `setCategory`. Sound only ever begins on a tap (FEATURE_SPEC §4, *Autoplay restore*), and both layers off is a supported way to use the app — so activating at launch would cut off whatever the user was already listening to before BIOSPHERE had made a sound of its own. The silent switch is governed by the *category*; iOS activates the session implicitly when audio actually starts, which is exactly when it should.
- Also handle **interruptions** (a call, another app taking the session): observe `AVAudioSession.interruptionNotification` and reactivate on `.ended`, but only when the payload carries `.shouldResume` — resuming without it is how an app talks over a call still in progress. Without any of this the world goes quiet after a phone call and never returns.
- **Watch for WebKit re-asserting its own category.** The shim configures the app's session, but the sound comes from a `WKWebView`, and WebKit sets a category of its own for web audio. The silent-switch test on hardware is the acceptance criterion, not the fact that the Swift compiled. Note too that reactivating the *session* need not wake a suspended `AudioContext`: `audio/engine.ts` only calls `resume()` inside the user-gesture start path, so if the soundscape stays dead after an interruption the remaining fix is in `src/`, not in `ios/`.

### 4b. Verify what was written blind

The bridge, the timer notification, and the haptics were written on Windows and have **never run on a device**. They are tested only to the extent that they do nothing, safely, off-native. On the first device build, confirm:

- Starting a focus timer prompts for notification permission **once**, at that moment — not at launch.
- Backgrounding the app and waiting out a short timer fires a notification reading *Your window has closed*.
- Stopping the timer, letting it complete in the foreground, or leaving the biosphere all **cancel** the pending notification (no ghost notification later).
- A light tap when a timer closes; a medium one when a day is sealed. Nothing else vibrates.

Use a 1-minute timer on a habit in Settings for this rather than waiting out 50 minutes.

### 4c. The device leg of the manual matrix

The browser half is done and recorded in PROJECT_STATUS. On hardware, still to check: OS-level reduced motion (Settings › Accessibility › Motion), the silent switch, backgrounding and interruptions, `-webkit-touch-callout` suppression (a WebKit property Chrome does not implement, so it has never actually been exercised), scroll and tap feel, and the safe-area padding against a real notch and home indicator.

Then profile the scene loop on hardware against the ENGINEERING_GUIDE budgets — the M4 item that was never possible on Windows.

## 5. Icon and launch screen

`assets/icon.png` is the owner's artwork, verified 1024², sRGB, no alpha.

```
npm i -D @capacitor/assets
npm run ios:assets
```

**Always the script, never `npx capacitor-assets generate` by hand** (done 2026-08-16). With no `splash.png` to work from, the generator derives both appearances from the icon and applies *its own* defaults — `#ffffff` light, `#111111` dark — ignoring `capacitor.config.ts` completely. Since iOS serves the light variant to any device not in dark mode, the ordinary case was the white flash the background colour exists to prevent. `ios:assets` pins both appearances to `#05070b`; the colours live in `package.json` beside the other `ios:*` scripts so the correct command is the easy one. Omitting `--ios` also scatters PWA output (`icons/`, `public/manifest.webmanifest`) that nothing here wants.

A `splash.png` (2732²) still does not exist — see `assets/README.md`. Derived from the app icon, the launch screen reads as a small tile floating on the dark, because the icon carries its own panel edge; it no longer flashes white, but it is not artwork that belongs to the background.

## 6. Signing and submission

Needs the **Apple Developer Program** membership ($99/yr) — the long-pole item.

Simplest first path: in Xcode, target **App** → *Signing & Capabilities* → tick **Automatically manage signing** and pick the team. Confirm the bundle identifier matches `capacitor.config.ts` — **`com.murasxkino.biosphere`** — and register that same identifier in App Store Connect. It is the app's permanent identity; changing it after first submission means a new app.

For CI later (Codemagic), generate an **App Store Connect API key** (Issuer ID, Key ID, `.p8`) and let the service manage certificates.

## 7. Gotchas worth knowing before they cost an afternoon

- **Web changes are invisible on device until `npm run ios:sync`.** Editing `src/` and rebuilding in Xcode alone does nothing; the native project holds a *copy* of the built web app.
- **Line endings**: the repo stores LF and is clean on macOS. If a mass whitespace diff ever appears, something reconfigured `core.autocrlf` — do not commit it.
- **The artifact target must keep working.** `npm run build:artifact` must still emit a file whose every top-level import is `react` alone. The native plugins are marked external precisely to preserve that; if the check ever fails, look there first.
- **`prefers-reduced-motion` on iOS** is Settings › Accessibility › Motion › Reduce Motion, and it must produce still scenes and instant transitions.
- **`FUTURE_CHANGES.md` is sealed** until v1.0 is live. It is not a source of tasks.

## 8. Definition of done for the Mac session

The app installs on a real iPhone from Xcode; it sounds correct with the ring switch silenced; audio survives locking the screen and a phone call; a backgrounded focus timer notifies once and never falsely; the device matrix is walked; and a TestFlight build is uploaded. At that point M7 closes and M8 (store listing, screenshots, submission) begins.
