import React, { useState, useMemo } from "react";
import { ARCH } from "../domain/constants";
import { t2m, dayKey, fmtDayKey } from "../domain/time";
import type { Biosphere, Habit, Journal, JournalEntry } from "../domain/types";
import { SceneCanvas } from "../scenes/SceneCanvas";
import { Ic } from "../ui/Ic";
import { Pill } from "../ui/Pill";
import { glassCard } from "../ui/style";

/* ========================================================================== */
/*  GREY NIGHT — the day's only accounting: one habit, one reflection         */
/* ========================================================================== */

export function NightView({ bios, habits, journal, now, soundOn, onToggleSound, onSeal, onExit }: {
  bios: Biosphere[];
  habits: Habit[];
  journal: Journal;
  now: Date;
  soundOn: boolean;
  onToggleSound: () => void;
  onSeal: (entries: Record<string, JournalEntry>) => void;
  onExit: () => void;
}) {
  const AN = ARCH.night;
  const key = dayKey(now);
  const existing = journal[key];

  const order = useMemo(() => {
    const m: Record<string, number> = {};
    [...bios].sort((a, b) => t2m(a.start) - t2m(b.start)).forEach((b, i) => { m[b.id] = i; });
    return m;
  }, [bios]);
  const ordered = useMemo(
    () => [...habits].sort((a, b) => ((order[a.biosphereId] ?? 99) - (order[b.biosphereId] ?? 99))),
    [habits, order]
  );
  const bioOf = (id: string) => bios.find((b) => b.id === id);
  const bioName = (id: string) => { const b = bioOf(id); return b ? b.name : ""; };
  const bioAccent = (id: string) => { const b = bioOf(id); return ARCH[b ? b.archetype : "night"].accent; };

  const [mode, setMode] = useState(existing ? "sealed" : "flow");
  const [step, setStep] = useState(-1);
  const [ans, setAns] = useState<Record<string, Partial<JournalEntry>>>(
    () => (existing ? JSON.parse(JSON.stringify(existing.entries || {})) : {})
  );

  const cur = step >= 0 && step < ordered.length ? ordered[step] : null;
  const a = cur ? ans[cur.id] : null;
  const setA = (patch: Partial<JournalEntry>) => {
    if (!cur) return;
    setAns((p) => ({
      ...p,
      [cur.id]: { name: cur.name, biosphere: bioName(cur.biosphereId), note: "", ...(p[cur.id] || {}), ...patch },
    }));
  };

  const finalize = () => {
    const out: Record<string, JournalEntry> = {};
    ordered.forEach((h) => {
      const e = ans[h.id] || {};
      out[h.id] = {
        name: h.name,
        biosphere: bioName(h.biosphereId),
        done: !!e.done,
        note: (e.note || "").trim(),
      };
    });
    onSeal(out);
    setMode("sealed");
  };

  const doneNow = ordered.filter((h) => ans[h.id] && ans[h.id].done).length;
  const sealedEntries = existing ? Object.values(existing.entries || {}) : [];

  return (
    <div className="bsRoot enterScene">
      <SceneCanvas kind="night" />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at 50% 40%, transparent 40%, rgba(2,4,8,0.45))" }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 18 }}>
          <button className="bsIcon" onClick={onExit} title="Leave" aria-label="Leave Grey Night">
            <Ic name="back" size={18} />
          </button>
          <div style={{ fontSize: 11, letterSpacing: "0.34em", color: AN.accent, textTransform: "uppercase" }}>Grey Night</div>
          <button className="bsIcon" onClick={onToggleSound} title="Ambient sound" aria-label="Toggle sound">
            <Ic name={soundOn ? "sound" : "mute"} size={18} />
          </button>
        </div>

        <div className="bsScroll" style={{ flex: 1 }}>
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 24px 60px", minHeight: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>

            {mode === "sealed" && (
              <div className="riseIn">
                <div style={{ textAlign: "center", marginBottom: 26 }}>
                  <div style={{ color: AN.accent, marginBottom: 10 }}><Ic name="moon" size={30} /></div>
                  <div className="serif" style={{ fontSize: 34, fontStyle: "italic", fontWeight: 500 }}>Reflected</div>
                  <div className="serif" style={{ fontStyle: "italic", fontSize: 15, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>{fmtDayKey(key)}</div>
                </div>
                <div style={{ ...glassCard, display: "flex", flexDirection: "column", gap: 14 }}>
                  {sealedEntries.map((e, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", flex: "none", background: e.done ? "#cfe0f0" : "transparent", border: "1px solid rgba(215,228,242,0.8)" }} />
                        <span style={{ fontSize: 15 }}>{e.name}</span>
                        <span style={{ fontSize: 10.5, letterSpacing: "0.16em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>{e.biosphere}</span>
                      </div>
                      {e.note ? (
                        <div className="serif" style={{ fontStyle: "italic", fontSize: 15, color: "rgba(255,255,255,0.75)", margin: "6px 0 0 18px", paddingLeft: 12, borderLeft: "1px solid rgba(255,255,255,0.18)", lineHeight: 1.55 }}>
                          {e.note}
                        </div>
                      ) : null}
                    </div>
                  ))}
                  {sealedEntries.length === 0 && (
                    <div className="serif" style={{ fontStyle: "italic", color: "rgba(255,255,255,0.6)" }}>A quiet day — nothing recorded.</div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>
                  <button className="bsBtn" onClick={() => { setMode("flow"); setStep(0); }}>Amend reflections</button>
                  <button className="bsBtn primary" onClick={onExit}>Rest well</button>
                </div>
              </div>
            )}

            {mode === "flow" && step === -1 && (
              <div className="riseIn" style={{ textAlign: "center" }}>
                <div style={{ color: AN.accent, marginBottom: 12 }}><Ic name="moon" size={34} /></div>
                <div className="serif" style={{ fontSize: 40, fontStyle: "italic", fontWeight: 500 }}>Grey Night</div>
                <div className="serif" style={{ fontStyle: "italic", fontSize: 15.5, color: "rgba(255,255,255,0.65)", marginTop: 5 }}>{fmtDayKey(key)}</div>
                {ordered.length ? (
                  <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.78)", margin: "22px 0 28px" }}>
                    The day settles.<br />
                    {ordered.length} {ordered.length === 1 ? "reflection awaits" : "reflections await"} — one habit at a time.
                  </p>
                ) : (
                  <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.78)", margin: "22px 0 28px" }}>
                    No habits to reflect on yet.<br />Plant some in settings, and return tomorrow night.
                  </p>
                )}
                {ordered.length ? (
                  <button className="bsBtn primary" onClick={() => setStep(0)}>Begin</button>
                ) : (
                  <button className="bsBtn" onClick={onExit}>Return</button>
                )}
              </div>
            )}

            {mode === "flow" && cur && (
              <div className="riseIn" key={step}>
                <div style={{ display: "flex", justifyContent: "center", gap: 7, marginBottom: 26 }}>
                  {ordered.map((h, i) => (
                    <span key={h.id} style={{
                      width: i === step ? 18 : 6, height: 6, borderRadius: 3,
                      background: i < step ? "rgba(215,228,242,0.85)" : i === step ? AN.accent : "rgba(255,255,255,0.22)",
                      transition: "all .4s",
                    }} />
                  ))}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: bioAccent(cur.biosphereId) }}>
                    {bioName(cur.biosphereId)}
                  </div>
                  <div className="serif" style={{ fontSize: 31, fontWeight: 500, margin: "6px 0 4px" }}>{cur.name}</div>
                  <div style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", margin: "12px 0 18px" }}>
                    Did you complete this today?
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
                    <Pill on={a && a.done === true} accent="#d7e4f2" onClick={() => setA({ done: true })}>● Yes</Pill>
                    <Pill on={a && a.done === false} accent="#8f9cb5" onClick={() => setA({ done: false })}>○ Not today</Pill>
                  </div>
                  <textarea
                    className="bsInput"
                    rows={3}
                    placeholder="A few words of reflection, if you like…"
                    value={(a && a.note) || ""}
                    onChange={(e) => setA({ note: e.target.value })}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
                    <button className="bsBtn" onClick={() => setStep((s) => s - 1)}>Back</button>
                    <button
                      className="bsBtn primary"
                      disabled={!a || a.done === undefined}
                      onClick={() => setStep((s) => s + 1)}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mode === "flow" && step >= ordered.length && ordered.length > 0 && (
              <div className="riseIn" style={{ textAlign: "center" }}>
                <div className="serif" style={{ fontSize: 36, fontStyle: "italic", fontWeight: 500 }}>The day is complete.</div>
                <div style={{ fontSize: 15, color: "rgba(255,255,255,0.78)", margin: "14px 0 6px" }}>
                  {doneNow} of {ordered.length} {ordered.length === 1 ? "habit" : "habits"} fulfilled.
                </div>
                <div className="serif" style={{ fontStyle: "italic", fontSize: 17, color: AN.accent, marginBottom: 30 }}>Rest well.</div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="bsBtn" onClick={() => setStep(ordered.length - 1)}>Back</button>
                  <button className="bsBtn primary" onClick={finalize}>Seal the day ✦</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
