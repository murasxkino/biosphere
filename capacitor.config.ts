import type { CapacitorConfig } from "@capacitor/cli";

/* The native shell (ADR-9). One codebase, three targets: this file governs the
   iOS one. Generating the native project (`npm run ios:add`) needs macOS; every
   setting here is portable and lives in git.

   appId is the bundle identifier — the app's permanent identity on the App
   Store. It cannot be changed after the first submission without registering a
   new app and losing continuity, so it is the owner's call to confirm before
   the app is created in App Store Connect. */

const config: CapacitorConfig = {
  appId: "com.murasxkino.biosphere",
  appName: "BIOSPHERE",
  webDir: "dist",

  // the world's own background — no white flash between launch and first paint
  backgroundColor: "#05070b",

  ios: {
    backgroundColor: "#05070b",

    // We place the chrome ourselves with env(safe-area-inset-*) in ui/style.ts
    // (index.html already sets viewport-fit=cover). WKWebView must not add its
    // own inset on top of that, or every edge would be padded twice.
    contentInset: "never",

    // The app is a fixed stage: .bsRoot is position:fixed and the scrolling
    // lives in inner .bsScroll containers. Disabling the web view's own scroll
    // view removes the whole-page rubber-band bounce that reads as "website".
    scrollEnabled: false,

    // Render as a phone app, not a desktop page.
    preferredContentMode: "mobile",
  },
};

export default config;
