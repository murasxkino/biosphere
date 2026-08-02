import React from "react";
import { SceneCanvas } from "../scenes/SceneCanvas";
import { Ic } from "./Ic";

/* shared scaffold for the quiet inner pages (journal / stillness / settings) */
export function Shell({
  kind,
  title,
  sub,
  onBack,
  children,
}: {
  kind: string;
  title: string;
  sub?: string;
  onBack: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="bsRoot">
      <div style={{ position: "absolute", inset: 0 }}>
        <SceneCanvas kind={kind} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "rgba(4,7,11,0.78)" }} />
      <div className="bsScroll" style={{ position: "relative" }}>
        <div
          className="fadeIn"
          style={{
            maxWidth: 560,
            margin: "0 auto",
            padding:
              "calc(22px + var(--sat)) calc(20px + var(--sar)) calc(72px + var(--sab)) calc(20px + var(--sal))",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button className="bsIcon" onClick={onBack} title="Back" aria-label="Back">
              <Ic name="back" size={18} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="serif" style={{ fontSize: 30, fontWeight: 500, fontStyle: "italic" }}>
                {title}
              </div>
              {sub && (
                <div
                  style={{
                    fontSize: 11.5,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.5)",
                    marginTop: 2,
                  }}
                >
                  {sub}
                </div>
              )}
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
