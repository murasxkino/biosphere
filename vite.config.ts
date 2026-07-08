/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The app was written for React's classic JSX runtime (explicit `import React`),
// matching the legacy artifact; keep it that way for diff-ability and so the
// artifact bundle needs only a bare "react" import.
export default defineConfig({
  plugins: [react({ jsxRuntime: "classic" })],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: false,
  },
});
