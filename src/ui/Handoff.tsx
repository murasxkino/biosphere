import React, { useEffect, useState } from "react";

/* a quiet countdown offering passage into the biosphere that just began */
export function Handoff({ label, accent, until, total, onCross, onRemain }: {
  label: string;
  accent: string;
  until: number;
  total: number;
  onCross: () => void;
  onRemain: () => void;
}) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick((x) => x + 1), 150);
    return () => clearInterval(iv);
  }, []);
  const left = Math.max(0, until - Date.now());
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 24, display: "flex", justifyContent: "center", zIndex: 55, pointerEvents: "none" }}>
      <div className="riseIn" style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 14, padding: "12px 16px 12px 20px", borderRadius: 999, background: "rgba(9,13,20,0.72)", border: "1px solid rgba(255,255,255,0.16)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", maxWidth: "calc(100vw - 32px)" }}>
        <button
          onClick={onCross}
          aria-label={"Cross into " + label + " now"}
          style={{ background: "none", border: "none", color: "#f2f4f7", cursor: "pointer", textAlign: "left", padding: 0, minWidth: 0 }}
        >
          <div style={{ fontSize: 11, letterSpacing: "0.26em", textTransform: "uppercase", color: accent, whiteSpace: "nowrap" }}>{label} begins</div>
          <div style={{ height: 2, marginTop: 7, width: 148, background: "rgba(255,255,255,0.16)", borderRadius: 2 }}>
            <div style={{ height: "100%", width: (100 * left / total) + "%", background: accent, borderRadius: 2, transition: "width .15s linear" }} />
          </div>
        </button>
        <button className="bsPill" style={{ padding: "8px 14px", fontSize: 12.5, flex: "none" }} onClick={onRemain}>Remain here</button>
      </div>
    </div>
  );
}
