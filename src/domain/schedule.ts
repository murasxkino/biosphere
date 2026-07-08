import { t2m } from "./time";
import type { Biosphere } from "./types";

export interface Sched {
  currentId: string; // a biosphere id, or "night"
  endOf(id: string): string; // "HH:MM"
  nMin: number; // minutes since midnight, for callers that already computed it
}

/* Schedule resolution (FEATURE_SPEC §2): given biospheres sorted by start —
   if now < first start or now >= nightStart -> "night"; otherwise the last
   biosphere whose start <= now. endOf(id) is the next biosphere's start, or
   nightStart for the last one. Extracted verbatim from the App-root memo so
   the correctness core is unit-testable. */
export function computeSched(sorted: Biosphere[], nightStart: string, now: Date): Sched {
  const nMin = now.getHours() * 60 + now.getMinutes();
  const nightM = t2m(nightStart);
  let currentId = "night";
  if (sorted.length && nMin < nightM && nMin >= t2m(sorted[0].start)) {
    for (let i = 0; i < sorted.length; i++) {
      if (t2m(sorted[i].start) <= nMin) currentId = sorted[i].id;
    }
  }
  const endOf = (id: string) => {
    const i = sorted.findIndex((b) => b.id === id);
    if (i === -1) return nightStart;
    return i + 1 < sorted.length ? sorted[i + 1].start : nightStart;
  };
  return { currentId, endOf, nMin };
}
