/* Canonical data shapes (FEATURE_SPEC §1). Small and stable — typed once, here. */

export interface ArchTheme {
  label: string;
  tagline: string;
  accent: string;
  soft: string;
  glow: string;
  css: string;
  icon: string;
}

export interface Biosphere {
  id: string;
  name: string;
  archetype: string;
  start: string; // "HH:MM"
  purpose: string;
}

export interface Habit {
  id: string;
  name: string;
  biosphereId: string;
  timer: number | null; // minutes, null = untimed
}

/* Journal entries are snapshots: they keep the habit's name and biosphere name
   as they were on that day, so later edits never rewrite history. */
export interface JournalEntry {
  name: string;
  biosphere: string;
  done: boolean;
  note: string;
}

export interface JournalDay {
  sealedAt: number; // epoch ms
  entries: Record<string, JournalEntry>; // keyed by habitId
}

export type Journal = Record<string, JournalDay>; // keyed by dayKey

/* biosphere-config-v1 */
export interface AppConfig {
  onboarded: boolean;
  bios: Biosphere[];
  habits: Habit[];
  nightStart: string;
  volume: number;
  soundPref: boolean;
}

export type ViewName = "home" | "immersion" | "night" | "journal" | "stats" | "settings";

export interface ViewState {
  name: ViewName;
  id?: string;
}
