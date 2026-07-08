import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HomeView } from "./HomeView";
import { ImmersionView } from "./ImmersionView";
import { NightView } from "./NightView";
import { JournalView } from "./JournalView";
import { StatsView } from "./StatsView";
import { SettingsView } from "./SettingsView";
import { Onboard } from "./Onboard";
import { DEFAULT_BIOS, DEFAULT_HABITS } from "../domain/constants";
import { computeSched } from "../domain/schedule";
import { t2m, dayKey } from "../domain/time";
import type { Journal } from "../domain/types";

/* Fixture-prop render tests for every view (MIGRATION §4). Mid-morning on a
   fixed date: Tundra is the current biosphere. */

const bios = DEFAULT_BIOS;
const habits = DEFAULT_HABITS;
const sorted = [...bios].sort((a, b) => t2m(a.start) - t2m(b.start));
const now = new Date(2026, 6, 7, 10, 0);
const sched = computeSched(sorted, "21:30", now);
const noop = () => {};

const journalFixture: Journal = {
  "2026-07-06": {
    sealedAt: 1,
    entries: {
      h_deep: { name: "One deep work block", biosphere: "Tundra", done: true, note: "a clear morning" },
      h_move: { name: "Move your body", biosphere: "Volcanic", done: false, note: "" },
    },
  },
};

describe("HomeView", () => {
  it("renders the day: now-block, tiles, night tile, footer", () => {
    render(
      <HomeView
        sorted={sorted} habits={habits} journal={{}} now={now} sched={sched}
        nightStart="21:30" soundOn={false} onToggleSound={noop} onOpen={noop} currentArch="tundra"
      />
    );
    expect(screen.getAllByText("Tundra").length).toBeGreaterThanOrEqual(2); // now-block + tile
    expect(screen.getByText("NOW")).toBeTruthy();
    expect(screen.getAllByText("Grey Night").length).toBeGreaterThan(0);
    expect(screen.getByText("Step through the day, one biosphere at a time.")).toBeTruthy();
    expect(screen.getByLabelText("Settings")).toBeTruthy();
  });

  it("routes tile taps to immersion", () => {
    const onOpen = vi.fn();
    render(
      <HomeView
        sorted={sorted} habits={habits} journal={{}} now={now} sched={sched}
        nightStart="21:30" soundOn={false} onToggleSound={noop} onOpen={onOpen} currentArch="tundra"
      />
    );
    fireEvent.click(screen.getByText("Seaside"));
    expect(onOpen).toHaveBeenCalledWith({ name: "immersion", id: "b_seaside" });
  });

  it("reads pre-dawn as Before the day", () => {
    const dawn = new Date(2026, 6, 7, 5, 0);
    render(
      <HomeView
        sorted={sorted} habits={habits} journal={{}} now={dawn}
        sched={computeSched(sorted, "21:30", dawn)}
        nightStart="21:30" soundOn={false} onToggleSound={noop} onOpen={noop} currentArch="night"
      />
    );
    expect(screen.getByText("Before the day")).toBeTruthy();
    expect(screen.getByText(/opens at/)).toBeTruthy();
  });
});

describe("ImmersionView", () => {
  it("renders the biosphere, its habits, and timer affordances", () => {
    render(
      <ImmersionView
        bio={bios[0]} end="11:30" isNow={true}
        habits={habits.filter((h) => h.biosphereId === "b_tundra")}
        soundOn={false} onToggleSound={noop} onExit={noop}
      />
    );
    expect(screen.getByText("Tundra")).toBeTruthy();
    expect(screen.getByText("One deep work block")).toBeTruthy();
    expect(screen.getByText(/TAP TO BEGIN/)).toBeTruthy();
    expect(screen.getByText(/UNTIL/)).toBeTruthy();
  });

  it("offers open-window copy when the biosphere has no habits", () => {
    render(
      <ImmersionView
        bio={bios[3]} end="19:00" isNow={false} habits={[]}
        soundOn={false} onToggleSound={noop} onExit={noop}
      />
    );
    expect(screen.getByText(/This biosphere is open/)).toBeTruthy();
    expect(screen.getByText("A QUIET WINDOW")).toBeTruthy();
  });
});

describe("NightView", () => {
  it("opens the flow on an unsealed night and walks to the first habit", () => {
    render(
      <NightView
        bios={bios} habits={habits} journal={{}} now={now}
        soundOn={false} onToggleSound={noop} onSeal={noop} onExit={noop}
      />
    );
    expect(screen.getByText(/reflections await/)).toBeTruthy();
    fireEvent.click(screen.getByText("Begin"));
    expect(screen.getByText("Did you complete this today?")).toBeTruthy();
    expect(screen.getByText("One deep work block")).toBeTruthy(); // earliest biosphere first
    // Continue is gated until an answer is chosen
    expect((screen.getByText("Continue") as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByText("● Yes"));
    expect((screen.getByText("Continue") as HTMLButtonElement).disabled).toBe(false);
  });

  it("shows the sealed reading when tonight is already reflected", () => {
    const key = dayKey(now);
    const journal: Journal = { [key]: journalFixture["2026-07-06"] };
    render(
      <NightView
        bios={bios} habits={habits} journal={journal} now={now}
        soundOn={false} onToggleSound={noop} onSeal={noop} onExit={noop}
      />
    );
    expect(screen.getByText("Reflected")).toBeTruthy();
    expect(screen.getByText("a clear morning")).toBeTruthy();
    expect(screen.getByText("Amend reflections")).toBeTruthy();
    expect(screen.getByText("Rest well")).toBeTruthy();
  });

  it("seals the day with snapshot entries", () => {
    const onSeal = vi.fn();
    const oneHabit = [habits[0]];
    render(
      <NightView
        bios={bios} habits={oneHabit} journal={{}} now={now}
        soundOn={false} onToggleSound={noop} onSeal={onSeal} onExit={noop}
      />
    );
    fireEvent.click(screen.getByText("Begin"));
    fireEvent.click(screen.getByText("● Yes"));
    fireEvent.change(screen.getByPlaceholderText(/A few words/), { target: { value: "  good work  " } });
    fireEvent.click(screen.getByText("Continue"));
    fireEvent.click(screen.getByText("Seal the day ✦"));
    expect(onSeal).toHaveBeenCalledWith({
      h_deep: { name: "One deep work block", biosphere: "Tundra", done: true, note: "good work" },
    });
  });
});

describe("JournalView", () => {
  it("shows the quiet empty state", () => {
    render(<JournalView journal={{}} onBack={noop} />);
    expect(screen.getByText(/Nothing here yet/)).toBeTruthy();
  });

  it("lists sealed nights, newest open, with notes", () => {
    render(<JournalView journal={journalFixture} onBack={noop} />);
    expect(screen.getByText("1 OF 2 FULFILLED")).toBeTruthy();
    expect(screen.getByText("a clear morning")).toBeTruthy();
  });
});

describe("StatsView", () => {
  it("shows summary cards and per-habit streaks", () => {
    render(
      <StatsView
        habits={habits} bios={bios} journal={journalFixture} now={now}
        currentArch="tundra" onBack={noop}
      />
    );
    expect(screen.getByText("nights reflected")).toBeTruthy();
    expect(screen.getByText("habits fulfilled")).toBeTruthy();
    expect(screen.getByText("Growth is quiet. So is this page.")).toBeTruthy();
    // yesterday's done entry gives One deep work block a streak of 1
    expect(screen.getAllByText(/day streak/).length).toBe(habits.length);
  });
});

describe("SettingsView", () => {
  const props = {
    bios, setBios: vi.fn(), habits, setHabits: vi.fn(),
    nightStart: "21:30", setNightStart: vi.fn(),
    soundOn: false, onToggleSound: noop, volume: 0.7, onVolume: vi.fn(),
    notify: vi.fn(), onReset: vi.fn(), currentArch: "tundra", onBack: noop,
  };

  it("renders every section", () => {
    render(<SettingsView {...props} />);
    expect(screen.getByText("Ambient sound")).toBeTruthy();
    expect(screen.getByText("Add Biosphere")).toBeTruthy();
    expect(screen.getByText("Add Habit")).toBeTruthy();
    expect(screen.getByText("Reset everything")).toBeTruthy();
  });

  it("warns inline when Grey Night overlaps a biosphere start", () => {
    render(<SettingsView {...props} nightStart="18:00" />);
    expect(screen.getByText(/will never appear as now/)).toBeTruthy();
  });

  it("two-step reset arms before it fires", () => {
    const onReset = vi.fn();
    render(<SettingsView {...props} onReset={onReset} />);
    fireEvent.click(screen.getByText("Reset everything"));
    expect(onReset).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Tap again to confirm"));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});

describe("Onboard", () => {
  it("offers the threshold: tagline, sound pill, Enter", () => {
    const onEnter = vi.fn();
    render(<Onboard onEnter={onEnter} />);
    expect(screen.getByText("One day, lived in nature.")).toBeTruthy();
    fireEvent.click(screen.getByText("Enter"));
    expect(onEnter).toHaveBeenCalledWith(true); // sound pill defaults on
  });
});
