import React from "react";
import { ARCH } from "../domain/constants";
import { dayKey, fmtDayKey } from "../domain/time";
import { lastNDays, habitSeries, calcStreak, calcBest } from "../domain/stats";
import type { Biosphere, Habit, Journal } from "../domain/types";
import { SectionLabel } from "../ui/SectionLabel";
import { Shell } from "../ui/Shell";
import { glassCard } from "../ui/style";

/* ========================================================================== */
/*  STILLNESS — streaks & rhythm, without noise                               */
/* ========================================================================== */

export function StatsView({ habits, bios, journal, now, currentArch, onBack }: {
  habits: Habit[];
  bios: Biosphere[];
  journal: Journal;
  now: Date;
  currentArch: string;
  onBack: () => void;
}) {
  const todayK = dayKey(now);
  const days28 = lastNDays(28, todayK);
  const daysReflected = Object.keys(journal).length;
  let totalDone = 0;
  Object.values(journal).forEach((d) => Object.values(d.entries || {}).forEach((e) => { if (e.done) totalDone++; }));

  return (
    <Shell kind={currentArch} title="Stillness" sub="streaks & rhythm" onBack={onBack}>
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <div style={{ ...glassCard, flex: 1, textAlign: "center" }}>
          <div className="serif" style={{ fontSize: 34, fontWeight: 500 }}>{daysReflected}</div>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>nights reflected</div>
        </div>
        <div style={{ ...glassCard, flex: 1, textAlign: "center" }}>
          <div className="serif" style={{ fontSize: 34, fontWeight: 500 }}>{totalDone}</div>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>habits fulfilled</div>
        </div>
      </div>

      <SectionLabel>habits · last 28 days</SectionLabel>
      {habits.length === 0 && (
        <div className="serif" style={{ fontStyle: "italic", color: "rgba(255,255,255,0.6)", fontSize: 16 }}>
          No habits yet — plant some in settings.
        </div>
      )}
      {habits.map((h) => {
        const b = bios.find((x) => x.id === h.biosphereId);
        const A = ARCH[b ? b.archetype : "night"];
        const series = habitSeries(journal, h.id);
        const streak = calcStreak(series, todayK);
        const best = Math.max(calcBest(series), streak);
        return (
          <div key={h.id} style={{ ...glassCard, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 16 }}>{h.name}</span>
              <span style={{ fontSize: 10.5, letterSpacing: "0.16em", color: A.accent, textTransform: "uppercase" }}>{b ? b.name : ""}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "10px 0 12px" }}>
              <span className="serif" style={{ fontSize: 38, fontWeight: 500, color: A.soft }}>{streak}</span>
              <span style={{ fontSize: 12, letterSpacing: "0.14em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
                day streak · best {best}
              </span>
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {days28.map((k) => {
                const v = series[k];
                return (
                  <span key={k} title={fmtDayKey(k)} style={{
                    width: 9, height: 9, borderRadius: "50%",
                    background: v === true ? A.accent : "transparent",
                    border: v === true ? "1px solid transparent" : v === false ? "1px solid rgba(255,255,255,0.45)" : "1px solid rgba(255,255,255,0.14)",
                  }} />
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="serif" style={{ fontStyle: "italic", fontSize: 13.5, color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 26 }}>
        Growth is quiet. So is this page.
      </div>
    </Shell>
  );
}
