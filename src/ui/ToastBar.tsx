import React from "react";

export function ToastBar({ msg }: { msg: string }) {
  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        bottom: "calc(26px + var(--sab))",
        transform: "translateX(-50%)",
        zIndex: 60,
        pointerEvents: "none",
      }}
    >
      <div
        className="riseIn"
        style={{
          padding: "10px 20px",
          borderRadius: 999,
          fontSize: 13,
          letterSpacing: "0.05em",
          color: "#eef2f7",
          background: "rgba(12,17,24,0.74)",
          border: "1px solid rgba(255,255,255,0.14)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          whiteSpace: "nowrap",
        }}
      >
        {msg}
      </div>
    </div>
  );
}
