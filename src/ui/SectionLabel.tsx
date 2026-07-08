import React from "react";

export function SectionLabel({ children }: { children?: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", margin: "32px 0 12px" }}>
      {children}
    </div>
  );
}
