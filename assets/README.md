# App icon and launch screen — source artwork

Capacitor generates every iOS icon and launch-screen size from a small number of source images placed **here**, at the repo root. This folder holds those sources; the generated output lands inside `ios/` and is not edited by hand.

## What is needed

| File              | Size        | Notes                                                                                                                          |
| ----------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `icon.png`        | 1024 × 1024 | No transparency, no rounded corners — iOS masks the corners itself. Also the App Store listing icon.                           |
| `splash.png`      | 2732 × 2732 | Centred artwork on `#05070b`; the edges get cropped on most devices, so keep anything meaningful well inside the middle third. |
| `splash-dark.png` | 2732 × 2732 | Optional. BIOSPHERE is dark in every theme, so a copy of `splash.png` is correct.                                              |

## Generating

On the Mac, once the iOS project exists:

```
npm i -D @capacitor/assets
npx capacitor-assets generate --ios
```

This writes `AppIcon.appiconset` and the launch-screen images into `ios/App/App/Assets.xcassets`, then `npm run ios:sync` carries the web build across.

`@capacitor/assets` is deliberately **not** a committed dependency: it pulls platform-specific image binaries, and it is only ever run on the build machine.

## Design constraints (from the constitution)

The icon is the app's first impression and the one piece of BIOSPHERE most people will see before they see anything else. It answers to the same rules as the rest:

- **The world, not the interface.** No wordmark-in-a-box, no UI chrome, no habit-tracker iconography (no checkmarks, no charts, no flames).
- **Generative and calm.** Palettes live in `ARCH` (`src/domain/constants.ts`); the app is built from gradients, particles, and quiet light. The icon should look like it was cut from one of the scenes.
- **Legible at 40 px.** Whatever it is must survive being tiny on a home screen — one clear silhouette, high contrast, no fine detail.
- **The ✦ glyph is reserved** for sealing and completion moments (UX_GUIDELINES). It is not a brand mark and should not be the icon.
- Dark by nature: `#05070b` is the app's ground, and the icon should sit in that world rather than on a light card.

Artwork is the owner's call — nothing here ships without their approval.
