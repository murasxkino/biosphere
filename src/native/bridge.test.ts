import { describe, it, expect, afterEach, vi } from "vitest";
import { isNative, notificationId, haptic, canNotify, scheduleTimerEnd, cancelTimerEnd } from "./bridge";

/* The bridge's first duty is to be invisible. Off native — which is every web
   build, the artifact, and this test suite — nothing may load, fire, or throw. */

afterEach(() => {
  delete (window as any).Capacitor;
  vi.restoreAllMocks();
});

describe("native detection", () => {
  it("is not native in a plain browser", () => {
    expect(isNative()).toBe(false);
  });

  it("is not native when Capacitor exists but reports the web", () => {
    (window as any).Capacitor = { isNativePlatform: () => false };
    expect(isNative()).toBe(false);
  });

  it("is native only when Capacitor says so", () => {
    (window as any).Capacitor = { isNativePlatform: () => true };
    expect(isNative()).toBe(true);
  });

  it("survives a malformed Capacitor global rather than throwing", () => {
    (window as any).Capacitor = { isNativePlatform: "not a function" };
    expect(isNative()).toBe(false);
  });
});

describe("off native, every entry point is a quiet no-op", () => {
  it("resolves without throwing and without asking for anything", async () => {
    await expect(
      Promise.all([
        haptic("light"),
        haptic("medium"),
        canNotify(),
        scheduleTimerEnd("h_deep", "One deep work block", new Date(Date.now() + 60000)),
        cancelTimerEnd("h_deep"),
      ])
    ).resolves.toBeDefined();
  });

  it("reports that it cannot notify", async () => {
    expect(await canNotify()).toBe(false);
  });
});

describe("notification ids", () => {
  it("are stable for a habit across calls", () => {
    expect(notificationId("h_deep")).toBe(notificationId("h_deep"));
  });

  it("differ between habits", () => {
    const ids = ["h_deep", "h_move", "h_rest", "h_reach", "h_still"].map(notificationId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("are positive integers inside the range Capacitor accepts", () => {
    for (const id of ["h_deep", "", "a", "a-very-long-habit-identifier-9999"].map(notificationId)) {
      expect(Number.isInteger(id)).toBe(true);
      expect(id).toBeGreaterThanOrEqual(0);
      expect(id).toBeLessThan(2000000000);
    }
  });
});

describe("scheduling refuses the impossible", () => {
  it("does not schedule a notification in the past", async () => {
    (window as any).Capacitor = { isNativePlatform: () => true };
    // if it got as far as loading the plugin this would reject; it must return first
    await expect(
      scheduleTimerEnd("h_deep", "One deep work block", new Date(Date.now() - 1000))
    ).resolves.toBeUndefined();
  });
});
