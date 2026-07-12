/* Pure time utilities (FEATURE_SPEC §2). All schedule comparisons use minutes. */

export const t2m = (t: string | null | undefined) => {
  const p = String(t || "00:00").split(":");
  return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
};

export const fmtTime = (t: string | null | undefined) => {
  const p = String(t || "00:00").split(":");
  const d = new Date();
  d.setHours(parseInt(p[0], 10) || 0, parseInt(p[1], 10) || 0, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

export const fmtDate = (d: Date) =>
  d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

const localKey = (x: Date) =>
  x.getFullYear() +
  "-" +
  String(x.getMonth() + 1).padStart(2, "0") +
  "-" +
  String(x.getDate()).padStart(2, "0");

// A "day" rolls over at 4 AM, so a reflection finished after midnight
// still belongs to the day you actually lived.
export const dayKey = (d: Date = new Date()) => {
  const x = new Date(d);
  if (x.getHours() < 4) x.setDate(x.getDate() - 1);
  return localKey(x);
};

export const prevKey = (k: string) => {
  const p = k.split("-").map(Number);
  const d = new Date(p[0], p[1] - 1, p[2]);
  d.setDate(d.getDate() - 1);
  return localKey(d);
};

export const fmtDayKey = (k: string) => {
  const p = k.split("-").map(Number);
  return new Date(p[0], p[1] - 1, p[2]).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
};

export const msFmt = (ms: number) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
};
