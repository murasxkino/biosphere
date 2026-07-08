import React from "react";

export function Splash() {
  return (
    <div className="bsRoot" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="fadeIn" style={{ textAlign: "center" }}>
        <div style={{ letterSpacing: "0.5em", fontWeight: 200, fontSize: 20, marginLeft: "0.5em" }}>BIOSPHERE</div>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#9fd8e8", margin: "18px auto 0", animation: "bsBreathe 2.2s ease-in-out infinite" }} />
      </div>
    </div>
  );
}
