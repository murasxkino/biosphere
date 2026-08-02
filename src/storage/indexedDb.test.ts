import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { IDBFactory } from "fake-indexeddb";

/* jsdom ships no IndexedDB, so the driver is exercised against fake-indexeddb.
   The stakes here are the journal: a day is written the moment it is sealed,
   and an upgrade must never cost someone their reflections. */

let indexedDbAdapter: typeof import("./indexedDb").indexedDbAdapter;
let hasIndexedDb: typeof import("./indexedDb").hasIndexedDb;
let store: typeof import("./adapter").store;

beforeEach(async () => {
  vi.resetModules(); // the driver memoises its open(); start each test clean
  (globalThis as any).indexedDB = new IDBFactory(); // a fresh database per test
  window.localStorage.clear();
  delete (window as any).storage;
  const idb = await import("./indexedDb");
  indexedDbAdapter = idb.indexedDbAdapter;
  hasIndexedDb = idb.hasIndexedDb;
  store = (await import("./adapter")).store;
});

afterEach(() => {
  delete (globalThis as any).indexedDB;
  window.localStorage.clear();
});

describe("the IndexedDB driver", () => {
  it("reports availability and round-trips a value", async () => {
    expect(hasIndexedDb()).toBe(true);
    await indexedDbAdapter.set("cfg", { onboarded: true, volume: 0.7 });
    expect(await indexedDbAdapter.get("cfg")).toEqual({ onboarded: true, volume: 0.7 });
  });

  it("returns null for an absent key", async () => {
    expect(await indexedDbAdapter.get("nothing-here")).toBeNull();
  });

  it("stores nested journal shapes intact", async () => {
    const journal = {
      "2026-07-11": {
        sealedAt: 1783833390238,
        entries: {
          h_deep: { name: "One deep work block", biosphere: "Tundra", done: true, note: "a clear morning" },
        },
      },
    };
    await indexedDbAdapter.set("biosphere-journal-v1", journal);
    expect(await indexedDbAdapter.get("biosphere-journal-v1")).toEqual(journal);
  });
});

describe("adoption of an existing localStorage session", () => {
  it("carries a previous journal across on first read, and keeps it thereafter", async () => {
    const journal = { "2026-07-10": { sealedAt: 1, entries: {} } };
    window.localStorage.setItem("biosphere-journal-v1", JSON.stringify(journal));

    // first read finds nothing in IDB and adopts what localStorage held
    expect(await indexedDbAdapter.get("biosphere-journal-v1")).toEqual(journal);

    // and it now lives in IDB, so losing localStorage costs nothing
    window.localStorage.clear();
    expect(await indexedDbAdapter.get("biosphere-journal-v1")).toEqual(journal);
  });

  it("does not let malformed leftovers become the user's state", async () => {
    window.localStorage.setItem("biosphere-config-v1", "{not json");
    expect(await indexedDbAdapter.get("biosphere-config-v1")).toBeNull();
  });

  it("never overwrites a value already in IndexedDB", async () => {
    await indexedDbAdapter.set("k", { source: "idb" });
    window.localStorage.setItem("k", JSON.stringify({ source: "stale" }));
    expect(await indexedDbAdapter.get("k")).toEqual({ source: "idb" });
  });
});

describe("backend preference", () => {
  it("the store uses IndexedDB over localStorage when both exist", async () => {
    await store.set("pref", { via: "idb" });
    expect(await store.get("pref")).toEqual({ via: "idb" });
    expect(window.localStorage.getItem("pref")).toBeNull(); // localStorage untouched
  });

  it("window.storage still wins for the artifact target", async () => {
    const kv: Record<string, string> = {};
    (window as any).storage = {
      get: async (k: string) => (k in kv ? { value: kv[k] } : null),
      set: async (k: string, v: string) => {
        kv[k] = v;
      },
    };
    // the backend is chosen per call, so the same store picks it up immediately
    await store.set("cfg", { onboarded: true });
    expect(kv.cfg).toBe('{"onboarded":true}');
  });
});
