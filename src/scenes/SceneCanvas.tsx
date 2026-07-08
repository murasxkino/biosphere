import React, { useEffect, useRef } from "react";
import { makeScene } from "./makeScene";

/* full-bleed animated canvas; respects prefers-reduced-motion */
export function SceneCanvas({ kind }: { kind: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return; // no 2D surface (headless env) — the veil alone stands
    const scene = makeScene(kind);
    const reduced = typeof window !== "undefined" && window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, raf = 0, last = 0;
    const frame = (t: number, dt: number) => { try { scene.draw(ctx, W, H, t, dt); } catch (e) {} };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth || window.innerWidth;
      H = cv.clientHeight || window.innerHeight;
      cv.width = Math.max(1, Math.floor(W * dpr));
      cv.height = Math.max(1, Math.floor(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (scene.resize) scene.resize(W, H);
      if (reduced) frame(1.7, 0.016);
    };
    resize();
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(resize); ro.observe(cv); }
    else window.addEventListener("resize", resize);
    if (!reduced) {
      const loop = (ms: number) => {
        const t = ms / 1000;
        const dt = last ? Math.min(t - last, 0.05) : 0.016;
        last = t;
        frame(t, dt);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect(); else window.removeEventListener("resize", resize);
    };
  }, [kind]);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />;
}
