/// <reference types="vite/client" />

/* The Claude artifact sandbox's private async KV store (PRODUCT_REQUIREMENTS).
   Present in artifact builds; absent in local dev and tests. */
interface Window {
  storage?: {
    get(key: string): Promise<{ value: string } | null | undefined>;
    set(key: string, value: string): Promise<void>;
  };
}
