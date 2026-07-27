/// <reference types="vite/client" />

/* True only in the single-file artifact bundle; defined by each build target
   (vite.config.ts / scripts/build-artifact.mjs). Selects the font source. */
declare const __ARTIFACT_BUILD__: boolean;

/* The Claude artifact sandbox's private async KV store (PRODUCT_REQUIREMENTS).
   Present in artifact builds; absent in local dev and tests. */
interface Window {
  storage?: {
    get(key: string): Promise<{ value: string } | null | undefined>;
    set(key: string, value: string): Promise<void>;
  };
}
