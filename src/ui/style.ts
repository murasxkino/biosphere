import type { CSSProperties } from "react";

/* The one injected stylesheet (ARCHITECTURE ADR-5). */
export const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Outfit:wght@200;300;400;500&display=swap');
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body, #root { height: 100%; }
body { margin: 0; background: #05070b; }
button { font-family: inherit; }
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
  opacity: 0; pointer-events: none; transition: opacity .3s ease;
}
.bsLayer:hover .bsLayerSlider, .bsLayer:focus-within .bsLayerSlider {
  opacity: 1; pointer-events: auto;
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
