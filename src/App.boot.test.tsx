import React from "react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import App from "./App";
import { CONFIG_KEY } from "./domain/constants";

/* Boot sequence (FEATURE_SPEC §3.1–3.2): splash held >= 1100 ms while stored
   state loads, then onboarding on first run — or straight into the app when
   a config with onboarded:true is found. Replaces the legacy smoke.cjs. */

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  window.localStorage.clear();
});

const boot = async () => {
  render(<App />);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1250);
  });
};

describe("App boot", () => {
  it("shows the splash first", () => {
    render(<App />);
    expect(screen.getByText("BIOSPHERE")).toBeTruthy();
    expect(screen.queryByText("Enter")).toBeNull(); // still the threshold, not onboarding
  });

  it("lands on onboarding after the splash on a first run", async () => {
    await boot();
    expect(screen.getByText("One day, lived in nature.")).toBeTruthy();
    expect(screen.getByText("Enter")).toBeTruthy();
  });

  it("enters the app from onboarding", async () => {
    await boot();
    await act(async () => {
      screen.getByText("Enter").click();
    });
    expect(screen.getByText("Step through the day, one biosphere at a time.")).toBeTruthy();
    expect(screen.getAllByText("Grey Night").length).toBeGreaterThan(0);
  });

  it("skips onboarding when a persisted config says onboarded", async () => {
    window.localStorage.setItem(
      CONFIG_KEY,
      JSON.stringify({ onboarded: true, nightStart: "21:30", volume: 0.7, soundPref: false })
    );
    await boot();
    expect(screen.queryByText("Enter")).toBeNull();
    expect(screen.getByText("Step through the day, one biosphere at a time.")).toBeTruthy();
    // default biospheres hydrate when the config carries none
    expect(screen.getAllByText("Tundra").length).toBeGreaterThan(0);
  });

  it("hydrates persisted biospheres and habits", async () => {
    window.localStorage.setItem(
      CONFIG_KEY,
      JSON.stringify({
        onboarded: true,
        bios: [{ id: "b1", name: "My Morning", archetype: "tundra", start: "08:00", purpose: "begin" }],
        habits: [{ id: "h1", name: "Water the fern", biosphereId: "b1", timer: null }],
        nightStart: "22:00",
        volume: 0.5,
        soundPref: false,
      })
    );
    await boot();
    expect(screen.getByText("Water the fern")).toBeTruthy();
    expect(screen.getAllByText("My Morning").length).toBeGreaterThan(0);
  });
});
