/* Re-emit BIOSPHERE as a single-file Claude-artifact build.
   Dual-target delivery is a permanent requirement (docs/MIGRATION.md §5):
   the repo must always be able to ship back into the artifact sandbox.

   Output: dist/biosphere.artifact.jsx — one file, default-exporting App,
   importing only "react", persisting via window.storage (the adapter prefers
   it whenever it exists). After bundling, the script smoke-tests the file:
   module init + a boot render via react-dom/server, mirroring the checks the
   legacy artifact shipped with. */

import { build } from "esbuild";
import { copyFile, rm } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const OUT = "dist/biosphere.artifact.jsx";

const banner = [
  "// ============================================================================",
  "//  B I O S P H E R E  —  single-file artifact build",
  "//  Generated from src/ by `npm run build:artifact` — do not edit by hand.",
  "//  Parity oracle for v0.3.0-alpha: legacy/biosphere.artifact.jsx",
  "// ============================================================================",
].join("\n");

await build({
  entryPoints: ["src/App.tsx"],
  bundle: true,
  outfile: OUT,
  format: "esm",
  target: "es2020",
  jsx: "transform",
  // The sandbox is never a native platform, so src/native/bridge.ts short-circuits
  // before its dynamic imports ever run. Marking the plugins external keeps ~68 KB
  // of unreachable Capacitor out of the single file; the specifiers survive only
  // inside code that cannot execute here, so nothing is ever resolved.
  external: ["react", "@capacitor/*"],
  // The sandbox cannot serve bundled font files — this target keeps the CDN
  // import (src/ui/style.ts); the local @font-face block is dropped here.
  define: { __ARTIFACT_BUILD__: "true" },
  banner: { js: banner },
  legalComments: "none",
  logLevel: "info",
});

/* ---- smoke: module init + boot render, SSR ------------------------------- */
// Node will not import an .jsx path; smoke-test a temporary .mjs copy.
const SMOKE = "dist/.artifact-smoke.mjs";
await copyFile(OUT, SMOKE);
try {
  const React = (await import("react")).default;
  const { renderToString } = await import("react-dom/server");
  const mod = await import(pathToFileURL(SMOKE).href);
  const App = mod.default;
  if (typeof App !== "function") throw new Error("artifact does not default-export a component");
  const html = renderToString(React.createElement(App));
  if (!html.includes("BIOSPHERE")) throw new Error("boot render did not produce the splash");
  console.log("ARTIFACT_SMOKE_OK — module init + boot render fault-free");
} finally {
  await rm(SMOKE, { force: true });
}
