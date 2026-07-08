import { describe, it, expect } from "vitest";
import { lastNDays, habitSeries, calcStreak, calcBest } from "./stats";
import type { Journal } from "./types";

const day = (done: boolean | null, habitId = "h1") => ({
  sealedAt: 1,
  entries: done === null ? {} : { [habitId]: { name: "Habit", biosphere: "Tundra", done, note: "" } },
});

describe("lastNDays", () => {
  it("returns n keys ending today, oldest first", () => {
    const days = lastNDays(4, "2026-07-07");
    expect(days).toEqual(["2026-07-04", "2026-07-05", "2026-07-06", "2026-07-07"]);
  });
});

describe("habitSeries", () => {
  it("maps each reflected day to that habit's done flag", () => {
    const journal: Journal = {
      "2026-07-05": day(true),
      "2026-07-06": day(false),
    };
    expect(habitSeries(journal, "h1")).toEqual({ "2026-07-05": true, "2026-07-06": false });
  });

  it("skips days where the habit has no entry", () => {
    const journal: Journal = {
      "2026-07-05": day(true),
      "2026-07-06": day(null), // sealed, but this habit wasn't part of that day
    };
    expect(habitSeries(journal, "h1")).toEqual({ "2026-07-05": true });
  });

  it("still reads entries for a deleted habit (journal-only history, by design)", () => {
    const journal: Journal = { "2026-07-05": day(true, "h_deleted") };
    expect(habitSeries(journal, "h_deleted")).toEqual({ "2026-07-05": true });
    expect(habitSeries(journal, "h1")).toEqual({});
  });

  it("tolerates malformed journal days without entries", () => {
    const journal = { "2026-07-05": {} } as unknown as Journal;
    expect(habitSeries(journal, "h1")).toEqual({});
  });
});

describe("calcStreak", () => {
  it("counts consecutive done days ending today", () => {
    const series = { "2026-07-05": true, "2026-07-06": true, "2026-07-07": true };
    expect(calcStreak(series, "2026-07-07")).toBe(3);
  });

  it("falls back to yesterday when tonight is unreflected", () => {
    const series = { "2026-07-05": true, "2026-07-06": true };
    expect(calcStreak(series, "2026-07-07")).toBe(2);
  });

  it("is broken by a not-done day — today reflected false means 0", () => {
    const series = { "2026-07-06": true, "2026-07-07": false };
    expect(calcStreak(series, "2026-07-07")).toBe(0);
  });

  it("is broken by a gap in the chain", () => {
    const series = { "2026-07-03": true, "2026-07-04": true, "2026-07-06": true, "2026-07-07": true };
    expect(calcStreak(series, "2026-07-07")).toBe(2);
  });

  it("is 0 on an empty series", () => {
    expect(calcStreak({}, "2026-07-07")).toBe(0);
  });
});

describe("calcBest", () => {
  it("finds the longest historical run of done days", () => {
    const series = {
      "2026-06-01": true, "2026-06-02": true, "2026-06-03": true, // 3
      "2026-06-05": true, // 1
      "2026-07-01": true, "2026-07-02": true, // 2
    };
    expect(calcBest(series)).toBe(3);
  });

  it("ignores not-done days when chaining", () => {
    const series = { "2026-06-01": true, "2026-06-02": false, "2026-06-03": true };
    expect(calcBest(series)).toBe(1);
  });

  it("chains across a month boundary", () => {
    const series = { "2026-06-30": true, "2026-07-01": true };
    expect(calcBest(series)).toBe(2);
  });

  it("is 0 on an empty series", () => {
    expect(calcBest({})).toBe(0);
  });
});
