import { describe, it, expect, afterEach, vi } from "vitest";
import { store } from "./adapter";

afterEach(() => {
  window.localStorage.clear();
  delete (window as any).storage;
  vi.restoreAllMocks();
});

describe("store over localStorage (local dev)", () => {
  it("round-trips JSON values", async () => {
    await store.set("k1", { a: 1, b: ["x"] });
    expect(await store.get("k1")).toEqual({ a: 1, b: ["x"] });
    expect(window.localStorage.getItem("k1")).toBe('{"a":1,"b":["x"]}');
  });

  it("returns null for an absent key", async () => {
    expect(await store.get("missing-key")).toBeNull();
  });

  it("survives malformed stored JSON (falls back rather than throwing)", async () => {
    window.localStorage.setItem("bad", "{not json");
    expect(await store.get("bad")).toBeNull();
  });
});

describe("store over window.storage (artifact target)", () => {
  it("prefers window.storage when it exists and speaks its {value} protocol", async () => {
    const kv: Record<string, string> = {};
    (window as any).storage = {
      get: vi.fn(async (k: string) => (k in kv ? { value: kv[k] } : null)),
      set: vi.fn(async (k: string, v: string) => { kv[k] = v; }),
    };
    await store.set("cfg", { onboarded: true });
    expect(await store.get("cfg")).toEqual({ onboarded: true });
    expect(kv.cfg).toBe('{"onboarded":true}');
    // localStorage must not be touched while window.storage exists
    expect(window.localStorage.getItem("cfg")).toBeNull();
  });
});

describe("memory fallback", () => {
  it("keeps the session coherent when the backend throws", async () => {
    (window as any).storage = {
      get: vi.fn(async () => { throw new Error("storage down"); }),
      set: vi.fn(async () => { throw new Error("storage down"); }),
    };
    await store.set("k2", { kept: true });
    expect(await store.get("k2")).toEqual({ kept: true });
  });
});
