# Third-party notices

Everything BIOSPHERE ships that someone else made, and the terms it ships under.
Kept current because the Apple Developer Program License Agreement makes the
account holder warrant that every asset in the app is properly licensed — and
because that account holder is not the person who wrote most of this.

## Typefaces — bundled in the app

| Family | Files | Licence |
|---|---|---|
| **Cormorant Garamond** | `cormorant*.woff2` (4) | SIL Open Font License 1.1 — `public/fonts/OFL-CormorantGaramond.txt` |
| **Outfit** | `outfit*.woff2` (2) | SIL Open Font License 1.1 — `public/fonts/OFL-Outfit.txt` |

The OFL permits bundling these files inside an application, including one sold
commercially, and requires that the licence text travel with them. It does, in
`public/fonts/`, which Vite copies into `dist/` and `cap sync` copies into
`ios/App/App/public/` — so the licences are inside the shipped app, not merely
in the repository. Neither family declares a Reserved Font Name, so nothing has
to be renamed. Neither licence requires attribution in the app's interface.

The artifact target is unaffected: it loads both faces from the Google Fonts CDN
rather than bundling them (`__ARTIFACT_BUILD__` in `ui/style.ts`), so it
redistributes no font files and carries no obligation.

## Soundtrack — bundled in the app

The five pieces in `public/music/` are the owner's own recordings; masters in
`audio-masters/`. No third-party licence applies. Worth stating plainly because
the App Store account holder will be warranting rights to music he did not
write — see the ownership note in PROJECT_STATUS.

## Runtime dependencies

React and Capacitor (MIT), plus the build toolchain, which ships no code into
the app beyond what it compiles. Full tree: `package.json`, `npm ls`.

## Icon and artwork

`assets/icon.png` and the derived launch screen are the owner's artwork.
