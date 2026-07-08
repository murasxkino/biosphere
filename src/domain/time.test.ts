import { describe, it, expect } from "vitest";
import { t2m, dayKey, prevKey, msFmt } from "./time";

describe("t2m", () => {
  it("converts HH:MM to minutes since midnight", () => {
    expect(t2m("00:00")).toBe(0);
    expect(t2m("09:30")).toBe(570);
    expect(t2m("21:30")).toBe(1290);
    expect(t2m("23:59")).toBe(1439);
  });

  it("tolerates malformed input by falling to 0 parts", () => {
    expect(t2m(undefined)).toBe(0);
    expect(t2m(null)).toBe(0);
    expect(t2m("")).toBe(0);
    expect(t2m("garbage")).toBe(0);
    expect(t2m("7")).toBe(420); // hours only
    expect(t2m("x:30")).toBe(30); // minutes survive a bad hour
  });
});

describe("dayKey — the 4 AM rollover", () => {
  it("keeps the calendar date from 4 AM onward", () => {
    expect(dayKey(new Date(2026, 6, 7, 4, 0))).toBe("2026-07-07");
    expect(dayKey(new Date(2026, 6, 7, 12, 0))).toBe("2026-07-07");
    expect(dayKey(new Date(2026, 6, 7, 23, 59))).toBe("2026-07-07");
  });

  it("assigns the small hours to the day just lived", () => {
    expect(dayKey(new Date(2026, 6, 7, 0, 0))).toBe("2026-07-06");
    expect(dayKey(new Date(2026, 6, 7, 3, 59))).toBe("2026-07-06");
  });

  it("crosses month and year boundaries correctly", () => {
    expect(dayKey(new Date(2026, 7, 1, 2, 0))).toBe("2026-07-31");
    expect(dayKey(new Date(2026, 0, 1, 1, 30))).toBe("2025-12-31");
  });

  it("zero-pads months and days", () => {
    expect(dayKey(new Date(2026, 0, 5, 12, 0))).toBe("2026-01-05");
  });
});

describe("prevKey", () => {
  it("steps back one day", () => {
    expect(prevKey("2026-07-07")).toBe("2026-07-06");
  });

  it("steps across month and year boundaries", () => {
    expect(prevKey("2026-03-01")).toBe("2026-02-28");
    expect(prevKey("2024-03-01")).toBe("2024-02-29"); // leap year
    expect(prevKey("2026-01-01")).toBe("2025-12-31");
  });
});

describe("msFmt", () => {
  it("formats m:ss, ceiling to the next second", () => {
    expect(msFmt(0)).toBe("0:00");
    expect(msFmt(1000)).toBe("0:01");
    expect(msFmt(59999)).toBe("1:00");
    expect(msFmt(61000)).toBe("1:01");
    expect(msFmt(50 * 60000)).toBe("50:00");
  });

  it("never goes negative", () => {
    expect(msFmt(-5000)).toBe("0:00");
  });
});
