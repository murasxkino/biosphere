import type { StorageAdapter } from "./adapter";

/* Local development and tests only. localStorage is forbidden in the artifact
   sandbox (PRODUCT_REQUIREMENTS) — artifact builds run on window.storage,
   which takes priority in the adapter whenever it exists. */
export const hasLocalStorage = () => {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch (e) {
    return false;
  }
};

export const localStorageAdapter: StorageAdapter = {
  async get(k) {
    const raw = window.localStorage.getItem(k);
    return raw ? JSON.parse(raw) : null;
  },
  async set(k, v) {
    window.localStorage.setItem(k, JSON.stringify(v));
  },
};
