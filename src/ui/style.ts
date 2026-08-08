import type { CSSProperties } from "react";

/* Typefaces (ADR-9 consequence). The web and native targets ship the fonts in
   the bundle — no CDN, no runtime network (NFR-3). The artifact sandbox cannot
   serve files, so that target alone keeps the Google Fonts import it was
   designed around. `__ARTIFACT_BUILD__` is defined by each build (vite.config
   / scripts/build-artifact.mjs); the unused branch is dropped at bundle time. */
const ARTIFACT = typeof __ARTIFACT_BUILD__ !== "undefined" && __ARTIFACT_BUILD__;

const FONTS_CDN = `@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Outfit:wght@200;300;400;500&display=swap');`;

/* Variable fonts: one file per family + style covers every weight we use. */
const FONTS_LOCAL = `
@font-face {
  font-family: 'Cormorant Garamond';
  font-style: italic;
  font-weight: 400 500;
  font-display: swap;
  src: url(/fonts/cormorant-italic-ext.woff2) format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'Cormorant Garamond';
  font-style: italic;
  font-weight: 400 500;
  font-display: swap;
  src: url(/fonts/cormorant-italic.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'Cormorant Garamond';
  font-style: normal;
  font-weight: 400 600;
  font-display: swap;
  src: url(/fonts/cormorant-ext.woff2) format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'Cormorant Garamond';
  font-style: normal;
  font-weight: 400 600;
  font-display: swap;
  src: url(/fonts/cormorant.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 200 500;
  font-display: swap;
  src: url(/fonts/outfit-ext.woff2) format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'Outfit';
  font-style: normal;
  font-weight: 200 500;
  font-display: swap;
  src: url(/fonts/outfit.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}`;

/* The one injected stylesheet (ARCHITECTURE ADR-5). */
export const STYLE = `
${ARTIFACT ? FONTS_CDN : FONTS_LOCAL}
/* Device safe areas (notch, home indicator, rounded corners). index.html sets
   viewport-fit=cover, so the world reaches the screen edges — these keep the
   *chrome* clear of them. 0px everywhere the insets don't exist, so the web
   and artifact targets are unaffected. APP_STORE_ROADMAP §4. */
:root {
  --sat: env(safe-area-inset-top, 0px);
  --sab: env(safe-area-inset-bottom, 0px);
  --sal: env(safe-area-inset-left, 0px);
  --sar: env(safe-area-inset-right, 0px);
}
* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  /* no long-press magnifier or share sheet over the world (native feel) */
  -webkit-touch-callout: none;
}
html, body, #root { height: 100%; }
html {
  /* iOS otherwise inflates text on its own and breaks the type scale */
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}
body {
  margin: 0;
  background: #05070b;
  /* the stage does not bounce; scrolling belongs to .bsScroll */
  overscroll-behavior: none;
}
button { font-family: inherit; }
/* Chrome is for operating, not for selecting — but never touch the user's own
   words: journal entries and reflections stay selectable and copyable. */
.bsIcon, .bsBtn, [role="button"] {
  -webkit-user-select: none; user-select: none;
  /* removes the double-tap zoom delay on taps */
  touch-action: manipulation;
}
:focus-visible { outline: 2px solid rgba(255,255,255,0.55); outline-offset: 2px; }
.bsRoot {
  position: fixed; inset: 0; overflow: hidden;
  background: #05070b; color: #f2f4f7;
  font-family: 'Outfit', system-ui, sans-serif; font-weight: 300;
}
.serif { font-family: 'Cormorant Garamond', Georgia, serif; }
.bsScroll {
  height: 100%; overflow-y: auto; overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  /* a page that has reached its end does not drag the whole app with it */
  overscroll-behavior: contain;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.16) transparent;
}
.bsScroll::-webkit-scrollbar { width: 4px; }
.bsScroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.16); border-radius: 4px; }
.bsScroll::-webkit-scrollbar-track { background: transparent; }
.bsIcon {
  width: 40px; height: 40px; border-radius: 14px; flex: none;
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.13);
  color: rgba(255,255,255,0.88); cursor: pointer;
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  transition: background .25s, transform .15s;
}
.bsIcon:hover { background: rgba(255,255,255,0.13); }
.bsIcon:active { transform: scale(0.94); }
.bsBtn {
  padding: 12px 26px; border-radius: 999px; cursor: pointer;
  border: 1px solid rgba(255,255,255,0.2); color: #f2f4f7;
  background: rgba(255,255,255,0.07);
  font: 400 14px 'Outfit', sans-serif; letter-spacing: 0.08em;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  transition: background .25s, transform .15s, opacity .25s;
}
.bsBtn:hover { background: rgba(255,255,255,0.13); }
.bsBtn:active { transform: scale(0.97); }
.bsBtn.primary { background: rgba(240,244,248,0.92); color: #0b1016; border-color: transparent; font-weight: 500; }
.bsBtn.primary:hover { background: #ffffff; }
.bsBtn:disabled { opacity: 0.35; cursor: default; }
.bsPill {
  padding: 10px 20px; border-radius: 999px; cursor: pointer;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.85);
  font: 400 14px 'Outfit', sans-serif; letter-spacing: 0.04em;
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  transition: all .25s;
}
.bsInput, .bsSelect {
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14);
  border-radius: 12px; color: #eef1f5; padding: 10px 12px;
  font: 400 16px 'Outfit', sans-serif; outline: none; min-width: 0;
  transition: border-color .25s;
}
.bsInput:focus, .bsSelect:focus { border-color: rgba(255,255,255,0.4); }
.bsInput::placeholder { color: rgba(255,255,255,0.35); }
.bsSelect option { background: #12161f; color: #eef1f5; }
input[type="time"].bsInput, input[type="number"].bsInput { color-scheme: dark; }
textarea.bsInput { resize: vertical; min-height: 88px; line-height: 1.55; width: 100%; }
.bsRange {
  -webkit-appearance: none; appearance: none; height: 3px; border-radius: 2px;
  background: rgba(255,255,255,0.22); outline: none; width: 100%;
}
.bsRange::-webkit-slider-thumb {
  -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%;
  background: #e8eef5; border: none; cursor: pointer;
}
.bsRange::-moz-range-thumb {
  width: 16px; height: 16px; border-radius: 50%;
  background: #e8eef5; border: none; cursor: pointer;
}
.bsLayer { position: relative; display: inline-flex; }
.bsLayerSlider {
  position: absolute; top: 46px; left: 50%; transform: translateX(-50%);
  width: 40px; height: 112px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(10,14,20,0.55); border: 1px solid rgba(255,255,255,0.13);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  opacity: 0; pointer-events: none; transition: opacity .25s ease .18s;
}
/* invisible bridge over the 6px gap so the cursor never leaves hover mid-travel */
.bsLayerSlider::before { content: ""; position: absolute; left: 0; right: 0; top: -8px; height: 8px; }
.bsLayer:hover .bsLayerSlider,
.bsLayer:active .bsLayerSlider,
.bsLayer:has(:focus-visible) .bsLayerSlider {
  opacity: 1; pointer-events: auto; transition-delay: 0s;
}
.bsLayerSlider .bsRange { width: 86px; transform: rotate(-90deg); flex: none; }
@keyframes bsFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes bsRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes bsEnter { from { opacity: 0; transform: scale(1.045); } to { opacity: 1; transform: scale(1); } }
@keyframes bsFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
@keyframes bsBreathe { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
@keyframes bsDrift { 0% { transform: translate(0,0); } 50% { transform: translate(-18px,-10px); } 100% { transform: translate(0,0); } }
@keyframes bsTileFloat { 0%, 100% { transform: translateY(0); opacity: 0.45; } 50% { transform: translateY(-9px); opacity: 0.9; } }
@keyframes bsVeilIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes bsVeilOut { from { opacity: 1; } to { opacity: 0; } }
.fadeIn { animation: bsFade .8s ease both; }
.fadeSlow { animation: bsFade 1.8s ease both; }
.riseIn { animation: bsRise .7s cubic-bezier(.2,.7,.2,1) both; }
.enterScene { animation: bsEnter 1s cubic-bezier(.2,.6,.2,1) both; }
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
`;

export const glassCard: CSSProperties = {
  background: "rgba(10,15,22,0.5)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 18,
  padding: 16,
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};
