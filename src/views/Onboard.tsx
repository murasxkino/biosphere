import React, { useState } from "react";
import { SceneCanvas } from "../scenes/SceneCanvas";
import { Ic } from "../ui/Ic";
import { Pill } from "../ui/Pill";

/* ========================================================================== */
/*  ONBOARDING — the threshold                                                */
/* ========================================================================== */

export function Onboard({ onEnter }: { onEnter: (withSound: boolean) => void }) {
  const [snd, setSnd] = useState(true);
  return (
    <div className="bsRoot">
      <SceneCanvas kind="mountain" />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(5,7,11,0.55), rgba(5,7,11,0.76))",
        }}
      />
      <div className="bsScroll" style={{ position: "relative" }}>
        <div
          className="fadeIn"
          style={{
            maxWidth: 420,
            margin: "0 auto",
            minHeight: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding:
              "calc(40px + var(--sat)) calc(28px + var(--sar)) calc(40px + var(--sab)) calc(28px + var(--sal))",
          }}
        >
          <div style={{ letterSpacing: "0.5em", fontWeight: 200, fontSize: 18, marginLeft: "0.5em" }}>
            BIOSPHERE
          </div>
          <div
            className="serif"
            style={{ fontStyle: "italic", fontSize: 21, color: "rgba(255,255,255,0.85)", marginTop: 14 }}
          >
            One day, lived in nature.
          </div>
          <p
            style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.75)", margin: "22px 0 30px" }}
          >
            Your day, arranged as landscapes. Habits rest inside each biosphere; when the Grey Night falls you
            reflect on them, one at a time, and seal the day.
          </p>
          <Pill on={snd} accent="#cfc0f2" onClick={() => setSnd((s) => !s)}>
            <span style={{ display: "inline-flex", verticalAlign: "-3px", marginRight: 8 }}>
              <Ic name={snd ? "sound" : "mute"} size={14} />
            </span>
            begin with ambient sound
          </Pill>
          <button
            className="bsBtn primary"
            style={{ marginTop: 26, padding: "13px 44px" }}
            onClick={() => onEnter(snd)}
          >
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}
