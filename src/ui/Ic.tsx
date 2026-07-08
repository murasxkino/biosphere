import React from "react";

export function Ic({ name, size = 20, style }: { name: string; size?: number; style?: React.CSSProperties }) {
  const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" } as const;
  const icons: Record<string, React.ReactElement> = {
    back: <path d="M15 5l-7 7 7 7" {...P} />,
    chev: <path d="M9 5l7 7-7 7" {...P} />,
    sound: (
      <g {...P}>
        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" />
        <path d="M15.5 9a4.2 4.2 0 010 6" />
        <path d="M18 6.8a7.4 7.4 0 010 10.4" />
      </g>
    ),
    mute: (
      <g {...P}>
        <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" />
        <path d="M16 9.5l5 5M21 9.5l-5 5" />
      </g>
    ),
    gear: (
      <g {...P}>
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.5 5.5l1.7 1.7M16.8 16.8l1.7 1.7M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7" />
      </g>
    ),
    book: (
      <g {...P}>
        <path d="M6.5 3.5h11v17h-11a1.5 1.5 0 01-1.5-1.5v-14a1.5 1.5 0 011.5-1.5z" />
        <path d="M9 8h6M9 11.5h6M9 15h4" />
      </g>
    ),
    sprout: (
      <g {...P}>
        <path d="M12 21v-8" />
        <path d="M12 13c0-4 3-6 7-6 0 4-3 6-7 6z" />
        <path d="M12 13c0-3-2.5-5-6-5 0 3 2.5 5 6 5z" />
      </g>
    ),
    plus: <path d="M12 5v14M5 12h14" {...P} />,
    trash: (
      <g {...P}>
        <path d="M4.5 7h15" />
        <path d="M9.5 7V5h5v2" />
        <path d="M6.5 7l1 13h9l1-13" />
        <path d="M10.5 11v5.5M13.5 11v5.5" />
      </g>
    ),
    clock: (
      <g {...P}>
        <circle cx="12" cy="12" r="8.2" />
        <path d="M12 7.5V12l3 2" />
      </g>
    ),
    x: <path d="M6 6l12 12M18 6L6 18" {...P} />,
    moon: <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" {...P} />,
    snow: (
      <g {...P}>
        <path d="M12 3v18M4.2 7.5l15.6 9M19.8 7.5l-15.6 9" />
        <path d="M12 3l-1.8 1.8M12 3l1.8 1.8M12 21l-1.8-1.8M12 21l1.8-1.8" />
      </g>
    ),
    volcano: (
      <g>
        <path d="M9.2 8.5h5.6L19 19.5H5L9.2 8.5z" {...P} />
        <circle cx="12" cy="5.4" r="0.7" fill="currentColor" stroke="none" />
        <circle cx="10.3" cy="3.4" r="0.55" fill="currentColor" stroke="none" />
        <circle cx="13.6" cy="3" r="0.55" fill="currentColor" stroke="none" />
      </g>
    ),
    wave: (
      <g {...P}>
        <path d="M3 10c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2" />
        <path d="M3 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2" />
      </g>
    ),
    tree: (
      <g {...P}>
        <path d="M12 3l5 7h-3l4 6H6l4-6H7l5-7z" />
        <path d="M12 16v5" />
      </g>
    ),
    peaks: <path d="M3 19l5.5-9 3 5 3.5-6L21 19H3z" {...P} />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style} aria-hidden="true">
      {icons[name] || null}
    </svg>
  );
}
