/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The app was written for React's classic JSX runtime (explicit `import React`),
// matching the legacy artifact; keep it that way for diff-ability and so the
// artifact bundle needs only a bare "react" import.
export default defineConfig({
  plugins: [react({ jsxRuntime: "classic" })],
  // Web and native ship their own fonts; only the artifact target uses the CDN
  // (src/ui/style.ts). scripts/build-artifact.mjs defines this as true.
  define: { __ARTIFACT_BUILD__: "false" },
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: false,
  },
});
