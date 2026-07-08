import type { ArchTheme, Biosphere, Habit } from "./types";

/* ------------------------------ archetypes ------------------------------- */

export const ARCH: Record<string, ArchTheme> = {
  tundra: {
    label: "Tundra", tagline: "deep focus",
    accent: "#9fd8e8", soft: "#e6f6fa", glow: "rgba(140,214,232,0.5)",
    css: "linear-gradient(178deg,#0a141d 0%,#123040 52%,#28505f 100%)",
    icon: "snow",
  },
  volcanic: {
    label: "Volcanic", tagline: "strenuous & vital",
    accent: "#ff9d6f", soft: "#ffe3d1", glow: "rgba(255,122,66,0.45)",
    css: "linear-gradient(178deg,#0c0507 0%,#230a0c 55%,#3d1410 100%)",
    icon: "volcano",
  },
  seaside: {
    label: "Seaside", tagline: "rest & restoration",
    accent: "#a5dee6", soft: "#eafbfd", glow: "rgba(150,220,230,0.45)",
    css: "linear-gradient(178deg,#16333f 0%,#3f7186 46%,#0e2a35 100%)",
    icon: "wave",
  },
  forest: {
    label: "Forest", tagline: "social & emotional",
    accent: "#b9e39a", soft: "#eef9df", glow: "rgba(170,224,140,0.4)",
    css: "linear-gradient(178deg,#09140c 0%,#173822 55%,#0e2415 100%)",
    icon: "tree",
  },
  mountain: {
    label: "Mountain", tagline: "spiritual practice",
    accent: "#cfc0f2", soft: "#f1ecfd", glow: "rgba(190,170,240,0.4)",
    css: "linear-gradient(178deg,#151027 0%,#2c2150 55%,#4a3670 100%)",
    icon: "peaks",
  },
  night: {
    label: "Grey Night", tagline: "reflection",
    accent: "#a9b4cd", soft: "#e9edf6", glow: "rgba(160,175,205,0.35)",
    css: "linear-gradient(178deg,#07090f 0%,#10151f 60%,#1a2230 100%)",
    icon: "moon",
  },
};

export const ARCH_KEYS = ["tundra", "volcanic", "seaside", "forest", "mountain"];

export const iconOf = (a: string) => (ARCH[a] || ARCH.night).icon;

/* ------------------------------- defaults -------------------------------- */

export const DEFAULT_BIOS: Biosphere[] = [
  { id: "b_tundra",   name: "Tundra",   archetype: "tundra",   start: "09:00", purpose: "Deep focus" },
  { id: "b_volcanic", name: "Volcanic", archetype: "volcanic", start: "11:30", purpose: "Strenuous & crucial" },
  { id: "b_seaside",  name: "Seaside",  archetype: "seaside",  start: "13:00", purpose: "Rest & restoration" },
  { id: "b_forest",   name: "Forest",   archetype: "forest",   start: "15:30", purpose: "Social & emotional" },
  { id: "b_mountain", name: "Mountain", archetype: "mountain", start: "19:00", purpose: "Spiritual practice" },
];

export const DEFAULT_HABITS: Habit[] = [
  { id: "h_deep",   name: "One deep work block",   biosphereId: "b_tundra",   timer: 50 },
  { id: "h_move",   name: "Move your body",        biosphereId: "b_volcanic", timer: 30 },
  { id: "h_rest",   name: "Rest, unplugged",       biosphereId: "b_seaside",  timer: 20 },
  { id: "h_reach",  name: "Reach out to someone",  biosphereId: "b_forest",   timer: null },
  { id: "h_still",  name: "Evening stillness",     biosphereId: "b_mountain", timer: 10 },
];

export const DEFAULT_NIGHT_START = "21:30";

export const CONFIG_KEY  = "biosphere-config-v1";
export const JOURNAL_KEY = "biosphere-journal-v1";
