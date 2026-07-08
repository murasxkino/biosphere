import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());

/* jsdom has no 2D canvas; the scenes only need a surface that accepts calls.
   Draw faults are survivable by design (each frame is try/caught), but resize
   and gradient plumbing run outside that guard, so give them a quiet stub. */
const gradient = { addColorStop() {} };
const ctx2d: any = {
  globalAlpha: 1,
  fillStyle: "",
  strokeStyle: "",
  lineWidth: 1,
  setTransform() {},
  fillRect() {},
  beginPath() {},
  closePath() {},
  fill() {},
  stroke() {},
  moveTo() {},
  lineTo() {},
  arc() {},
  ellipse() {},
  quadraticCurveTo() {},
  save() {},
  restore() {},
  translate() {},
  rotate() {},
  scale() {},
  createLinearGradient: () => gradient,
  createRadialGradient: () => gradient,
};
Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
  value: () => ctx2d,
  writable: true,
});

/* Deterministic no-op animation frame: scenes render nothing in tests. */
(globalThis as any).requestAnimationFrame = () => 0;
(globalThis as any).cancelAnimationFrame = () => {};
