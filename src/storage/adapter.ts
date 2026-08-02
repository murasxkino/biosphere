import { windowStorage, hasWindowStorage } from "./windowStorage";
import { indexedDbAdapter, hasIndexedDb } from "./indexedDb";
import { localStorageAdapter, hasLocalStorage } from "./localStorage.dev";

/* Values are JSON-serializable app state; keys are versioned (-v1). */
export interface StorageAdapter {
  get(key: string): Promise<any | null>;
  set(key: string, value: any): Promise<void>;
}

/* window.storage when present (the artifact target), then IndexedDB (web and
   native — durable, async, no size cliff; it adopts any existing localStorage
   data on first read), then localStorage, then memory. Chosen per call so an
   environment appearing late (or a backend throwing) never strands the session. */
const memFallback: Record<string, any> = {};

const backend = (): StorageAdapter | null => {
  if (hasWindowStorage()) return windowStorage;
  if (hasIndexedDb()) return indexedDbAdapter;
  if (hasLocalStorage()) return localStorageAdapter;
  return null;
};

/* Same contract as the artifact's store: get -> value or null, set -> fire and
   forget; every call try/caught; the in-memory copy keeps the session coherent
   when the backend fails (ARCHITECTURE ADR-2). */
export const store = {
  async get(k: string): Promise<any | null> {
    try {
      const b = backend();
      if (!b) return k in memFallback ? memFallback[k] : null;
      const v = await b.get(k);
      return v !== null && v !== undefined ? v : k in memFallback ? memFallback[k] : null;
    } catch (e) {
      return k in memFallback ? memFallback[k] : null;
    }
  },
  async set(k: string, v: any): Promise<void> {
    try {
      memFallback[k] = v;
      const b = backend();
      if (b) await b.set(k, v);
    } catch (e) {
      /* keep in-memory copy */
    }
  },
};
