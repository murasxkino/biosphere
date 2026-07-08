import React, { useState } from "react";
import { fmtDayKey } from "../domain/time";
import type { Journal } from "../domain/types";
import { Ic } from "../ui/Ic";
import { Shell } from "../ui/Shell";
import { glassCard } from "../ui/style";

/* ========================================================================== */
/*  JOURNAL — the nights, kept                                                */
/* ========================================================================== */

export function JournalView({ journal, onBack }: { journal: Journal; onBack: () => void }) {
  const keys = Object.keys(journal).sort().reverse();
  const [open, setOpen] = useState<string | null>(keys.length ? keys[0] : null);

  return (
    <Shell kind="night" title="Journal" sub="reflections, night by night" onBack={onBack}>
      {keys.length === 0 && (
        <div style={{ textAlign: "center", marginTop: 70, color: "rgba(255,255,255,0.6)" }}>
          <Ic name="moon" size={30} style={{ opacity: 0.7 }} />
          <div className="serif" style={{ fontStyle: "italic", fontSize: 17, marginTop: 14, lineHeight: 1.6 }}>
            Nothing here yet.<br />Reflections gather after each Grey Night.
          </div>
        </div>
      )}
      <div style={{ marginTop: 22 }}>
        {keys.map((k) => {
          const d = journal[k];
          const es = Object.values(d.entries || {});
          const done = es.filter((e) => e.done).length;
          const isOpen = open === k;
          return (
            <div key={k} style={{ ...glassCard, marginBottom: 12 }}>
              <div
                onClick={() => setOpen(isOpen ? null : k)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen(isOpen ? null : k); }}
                style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="serif" style={{ fontSize: 20, fontWeight: 500 }}>{fmtDayKey(k)}</div>
                  <div style={{ fontSize: 12, letterSpacing: "0.16em", color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
                    {done} OF {es.length} FULFILLED
                  </div>
                </div>
                <Ic name="chev" size={16} style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .3s", opacity: 0.7 }} />
              </div>
              {isOpen && (
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 13 }}>
                  {es.map((e, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}
