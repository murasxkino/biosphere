import { describe, it, expect } from "vitest";
import { computeSched } from "./schedule";
import { DEFAULT_NIGHT_START } from "./constants";
import { t2m } from "./time";
import type { Biosphere } from "./types";

/* Defaults, pre-sorted by start (computeSched's contract). */
const sorted: Biosphere[] = [
  { id: "b_tundra", name: "Tundra", archetype: "tundra", start: "09:00", purpose: "" },
  { id: "b_volcanic", name: "Volcanic", archetype: "volcanic", start: "11:30", purpose: "" },
  { id: "b_seaside", name: "Seaside", archetype: "seaside", start: "13:00", purpose: "" },
  { id: "b_forest", name: "Forest", archetype: "forest", start: "15:30", purpose: "" },
  { id: "b_mountain", name: "Mountain", archetype: "mountain", start: "19:00", purpose: "" },
];

const at = (hhmm: string) => {
  const m = t2m(hhmm);
  return new Date(2026, 6, 7, Math.floor(m / 60), m % 60);
};

const currentAt = (hhmm: string, nightStart = DEFAULT_NIGHT_START, bios = sorted) =>
  computeSched(bios, nightStart, at(hhmm)).currentId;

describe("computeSched — currentId (FEATURE_SPEC §2)", () => {
  it("is night before the first biosphere (pre-dawn and small hours)", () => {
    expect(currentAt("00:30")).toBe("night");
    expect(currentAt("04:00")).toBe("night");
    expect(currentAt("08:59")).toBe("night");
  });

  it("starts a biosphere exactly at its start minute", () => {
    expect(currentAt("09:00")).toBe("b_tundra");
    expect(currentAt("11:30")).toBe("b_volcanic");
  });

  it("holds the last started biosphere between starts", () => {
    expect(currentAt("10:59")).toBe("b_tundra");
    expect(currentAt("14:15")).toBe("b_seaside");
    expect(currentAt("20:00")).toBe("b_mountain");
  });

  it("is night from nightStart onward", () => {
    expect(currentAt("21:29")).toBe("b_mountain");
    expect(currentAt("21:30")).toBe("night");
    expect(currentAt("23:59")).toBe("night");
  });

  it("night-overlap: a biosphere starting at or after nightStart never appears as now", () => {
    const bios = [
      ...sorted,
      { id: "b_late", name: "Late", archetype: "forest", start: "22:00", purpose: "" },
    ];
    expect(currentAt("22:30", DEFAULT_NIGHT_START, bios)).toBe("night");
    // and one starting exactly at nightStart
    const bios2 = [
      ...sorted,
      { id: "b_edge", name: "Edge", archetype: "forest", start: "21:30", purpose: "" },
    ];
    expect(currentAt("21:30", DEFAULT_NIGHT_START, bios2)).toBe("night");
  });

  it("is night for an empty day", () => {
    expect(computeSched([], DEFAULT_NIGHT_START, at("12:00")).currentId).toBe("night");
  });
});

describe("computeSched — endOf", () => {
  const sched = computeSched(sorted, DEFAULT_NIGHT_START, at("10:00"));

  it("is the next biosphere's start", () => {
    expect(sched.endOf("b_tundra")).toBe("11:30");
    expect(sched.endOf("b_forest")).toBe("19:00");
  });

  it("is nightStart for the last biosphere", () => {
    expect(sched.endOf("b_mountain")).toBe("21:30");
  });

  it("is nightStart for an unknown id", () => {
    expect(sched.endOf("nope")).toBe("21:30");
  });
});
