import type { StorageAdapter } from "./adapter";

/* Durable key-value storage for the web and native targets (APP_STORE_ROADMAP
   §4). Preferred over localStorage because it is asynchronous — the journal is
   written the instant a day is sealed, and that write must never block a frame —
   and because it has no 5 MB cliff to grow into.

   Values are stored already-parsed; structured clone handles the shapes we use.
   Anything unexpected degrades to the next backend rather than throwing: the
   adapter's contract is that persistence failure costs a session, never a crash. */

const DB_NAME = "biosphere";
const STORE_NAME = "kv";
const DB_VERSION = 1;

export const hasIndexedDb = () => {
  try {
    return typeof indexedDB !== "undefined" && indexedDB !== null;
  } catch (e) {
    return false;
  }
};

let dbPromise: Promise<IDBDatabase> | null = null;

const open = (): Promise<IDBDatabase> => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error("indexedDB blocked"));
  });
  // a failed open must not poison every later call
  dbPromise.catch(() => {
    dbPromise = null;
  });
  return dbPromise;
};

const tx = <T>(mode: IDBTransactionMode, run: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> =>
  open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE_NAME, mode);
        const req = run(t.objectStore(STORE_NAME));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
        t.onabort = () => reject(t.error);
      })
  );

/* One-time adoption of anything a previous localStorage session left behind, so
   upgrading the app never costs a user their journal. Lazy and per-key: the
   first read that finds nothing here looks there, and brings it across. */
const adopt = async (key: string): Promise<any | null> => {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch (e) {
    return null;
  }
  if (raw === null) return null;
  let parsed: any;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    return null; // malformed leftovers are not worth carrying forward
  }
  try {
    await tx("readwrite", (s) => s.put(parsed, key));
  } catch (e) {
    /* adoption is best-effort; the value is still returned to the caller */
  }
  return parsed;
};

export const indexedDbAdapter: StorageAdapter = {
  async get(k) {
    const v = await tx<any>("readonly", (s) => s.get(k));
    if (v !== undefined && v !== null) return v;
    return adopt(k);
  },
  async set(k, v) {
    await tx("readwrite", (s) => s.put(v, k));
  },
};
