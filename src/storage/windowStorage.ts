import type { StorageAdapter } from "./adapter";

export const hasWindowStorage = () => typeof window !== "undefined" && !!window.storage;

/* The artifact target: JSON strings over the sandbox's async KV API. */
export const windowStorage: StorageAdapter = {
  async get(k) {
    const r = await window.storage!.get(k);
    return r && r.value ? JSON.parse(r.value) : null;
  },
  async set(k, v) {
    await window.storage!.set(k, JSON.stringify(v));
  },
};
