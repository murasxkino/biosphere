import React from "react";

export function Pill({ on, accent, onClick, children }: {
  on?: boolean | null;
  accent?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}) {
  const ac = accent || "#e8eef5";
  return (
    <button
      className="bsPill"
      onClick={onClick}
      style={on ? { background: ac, color: "#0b1016", borderColor: "transparent", fontWeight: 500 } : {}}
    >
      {children}
    </button>
  );
}
