import { prevKey } from "./time";
import type { Journal } from "./types";

/* A habit's series: dayKey -> done. Tolerates journal days without entries. */
export type Series = Record<string, boolean>;

export const lastNDays = (n: number, todayK: string) => {
  const arr: string[] = [];
  let k = todayK;
  for (let i = 0; i < n; i++) {
    arr.unshift(k);
    k = prevKey(k);
  }
  return arr;
};

export const habitSeries = (journal: Journal, habitId: string): Series => {
  const m: Series = {};
  Object.keys(journal).forEach((k) => {
    const e = journal[k] && journal[k].entries ? journal[k].entries[habitId] : null;
    if (e && e.done !== undefined) m[k] = !!e.done;
  });
  return m;
};

export const calcStreak = (series: Series, todayK: string) => {
  let k = todayK;
  if (series[k] === undefined) k = prevKey(todayK);
  let s = 0;
  while (series[k] === true) {
    s++;
    k = prevKey(k);
  }
  return s;
};

export const calcBest = (series: Series) => {
  const keys = Object.keys(series)
    .filter((k) => series[k])
    .sort();
  let best = 0,
    run = 0,
    prev: string | null = null;
  keys.forEach((k) => {
    run = prev && prevKey(k) === prev ? run + 1 : 1;
    if (run > best) best = run;
    prev = k;
  });
  return best;
};
