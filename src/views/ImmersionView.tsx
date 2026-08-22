import React, { useState, useEffect, useRef, useCallback } from "react";
import { ARCH, iconOf } from "../domain/constants";
import { fmtTime, msFmt } from "../domain/time";
import type { Biosphere, Habit } from "../domain/types";
import { AUDIO } from "../audio/engine";
import { haptic, scheduleTimerEnd, cancelTimerEnd } from "../native/bridge";
import { SceneCanvas } from "../scenes/SceneCanvas";
import { Ic } from "../ui/Ic";

/* ========================================================================== */
/*  IMMERSION — inside a biosphere. The interface dissolves; the world stays. */
/* ========================================================================== */

export function ImmersionView({
  bio,
  end,
  isNow,
  habits,
  soundOn,
  onToggleSound,
  soundLevel,
  onSoundLevel,
  musicOn,
  onToggleMusic,
  musicLevel,
  onMusicLevel,
  musicAvailable,
  onExit,
}: {
  bio: Biosphere;
  end: string;
  isNow: boolean;
  habits: Habit[];
  soundOn: boolean;
  onToggleSound: () => void;
  soundLevel: number;
  onSoundLevel: (v: number) => void;
  musicOn: boolean;
  onToggleMusic: () => void;
  musicLevel: number;
  onMusicLevel: (v: number) => void;
  musicAvailable: boolean;
  onExit: () => void;
}) {
  const A = ARCH[bio.archetype] || ARCH.night;
  // The window's hours are one thing and must never break across lines — a
  // stranded "PM" reads as a mistake rather than a line wrap.
  const hours = (fmtTime(bio.start) + " – " + fmtTime(end)).replace(/ /g, "\u00A0");
  const [ui, setUi] = useState(true);
  const hideT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const poke = useCallback(() => {
    setUi(true);
    clearTimeout(hideT.current);
    hideT.current = setTimeout(() => setUi(false), 6500);
  }, []);
  useEffect(() => {
    poke();
    return () => clearTimeout(hideT.current);
  }, [poke]);

  // optional per-habit focus timers (a quiet aid; completion is judged at night)
  const [runs, setRuns] = useState<Record<string, { end: number; total: number }>>({});
  const [doneT, setDoneT] = useState<Record<string, boolean>>({});
  const [, setTick] = useState(0);
  const running = Object.keys(runs).length > 0;
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => setTick((x) => x + 1), 500);
    return () => clearInterval(iv);
  }, [running]);
  // a timer is ephemeral by design: leaving the biosphere abandons it, so any
  // notification it scheduled must leave with it rather than ring for nothing
  const pending = useRef<string[]>([]);
  useEffect(() => {
    pending.current = Object.keys(runs);
  }, [runs]);
  useEffect(
    () => () => {
      pending.current.forEach((id) => cancelTimerEnd(id));
    },
    []
  );

  useEffect(() => {
    const t = Date.now();
    const finished = Object.keys(runs).filter((id) => t >= runs[id].end);
    if (finished.length) {
      AUDIO.chime();
      haptic("light");
      // it closed while we were watching — the scheduled notification is moot
      finished.forEach((id) => cancelTimerEnd(id));
      setRuns((r) => {
        const nr = { ...r };
        finished.forEach((id) => delete nr[id]);
        return nr;
      });
      setDoneT((d) => {
        const nd = { ...d };
        finished.forEach((id) => {
          nd[id] = true;
        });
        return nd;
      });
    }
  });

  const toggleTimer = (h: Habit) => {
    if (!h.timer) return;
    // iOS freezes JS timers in the background, so the notification is scheduled
    // when the timer starts rather than when it would fire (APP_STORE_ROADMAP §6)
    if (runs[h.id]) cancelTimerEnd(h.id);
    else scheduleTimerEnd(h.id, h.name, new Date(Date.now() + h.timer * 60000));
    setRuns((r) => {
      const nr = { ...r };
      if (nr[h.id]) delete nr[h.id];
      else nr[h.id] = { end: Date.now() + h.timer! * 60000, total: h.timer! * 60000 };
      return nr;
    });
    setDoneT((d) => {
      if (!d[h.id]) return d;
      const nd = { ...d };
      delete nd[h.id];
      return nd;
    });
    poke();
  };

  return (
    <div className="bsRoot enterScene" onPointerDown={poke} onPointerMove={poke}>
      <SceneCanvas kind={bio.archetype} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "radial-gradient(circle at 50% 42%, transparent 45%, rgba(3,5,9,0.35))",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          opacity: ui ? 1 : 0.05,
          transition: "opacity 1.6s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "calc(18px + var(--sat)) calc(18px + var(--sar)) 18px calc(18px + var(--sal))",
            gap: 10,
          }}
        >
          {/* The two side groups are held to the same width so the title sits on
              the true centre of the screen. The right side carries two icons and
              the left only one, and without this the name drifts 26 px left on a
              phone — enough to read as crooked. 90px = two 40px icons + the 10px
              gap; widen both together if a third control is ever added. */}
          <div style={{ flex: "0 0 90px", display: "flex", justifyContent: "flex-start" }}>
            <button
              className="bsIcon"
              onClick={(e) => {
                e.stopPropagation();
                onExit();
              }}
              title="Leave"
              aria-label="Leave biosphere"
            >
              <Ic name="back" size={18} />
            </button>
          </div>
          <div style={{ flex: "1 1 auto", textAlign: "center", marginTop: 2, minWidth: 0 }}>
            <div
              style={{ fontSize: 11, letterSpacing: "0.32em", color: A.accent, textTransform: "uppercase" }}
            >
              {isNow ? "now" : "biosphere"}
            </div>
            <div
              className="serif"
              style={{
                fontSize: 38,
                fontWeight: 500,
                letterSpacing: "0.05em",
                textShadow: "0 2px 26px rgba(0,0,0,0.55)",
              }}
            >
              {bio.name}
            </div>
            <div
              className="serif"
              style={{ fontStyle: "italic", fontSize: 15, color: "rgba(255,255,255,0.78)" }}
            >
              {(bio.purpose || A.tagline) + "  ·  " + hours}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flex: "0 0 90px", justifyContent: "flex-end" }}>
            {musicAvailable && (
              <div className="bsLayer">
                <button
                  className="bsIcon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleMusic();
                  }}
                  title="Soundtrack"
                  aria-label="Toggle soundtrack"
                  aria-pressed={musicOn}
                >
                  <Ic name={musicOn ? "music" : "musicOff"} size={18} />
                </button>
                <div className="bsLayerSlider">
                  <input
                    type="range"
                    className="bsRange"
                    min={0}
                    max={1}
                    step={0.05}
                    value={musicLevel}
                    onChange={(e) => onMusicLevel(parseFloat(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    aria-label="Soundtrack level"
                    aria-orientation="vertical"
                  />
                </div>
              </div>
            )}
            <div className="bsLayer">
              <button
                className="bsIcon"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSound();
                }}
                title="Ambient sound"
                aria-label="Toggle sound"
                aria-pressed={soundOn}
              >
                <Ic name={soundOn ? "sound" : "mute"} size={18} />
              </button>
              <div className="bsLayerSlider">
                <input
                  type="range"
                  className="bsRange"
                  min={0}
                  max={1}
                  step={0.05}
                  value={soundLevel}
                  onChange={(e) => onSoundLevel(parseFloat(e.target.value))}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Ambient sound level"
                  aria-orientation="vertical"
                />
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 27,
            padding: "0 30px 40px",
            overflowY: "auto",
          }}
        >
          {habits.length === 0 && (
            <div
              className="serif"
              style={{
                fontStyle: "italic",
                fontSize: 17,
                color: "rgba(255,255,255,0.7)",
                textAlign: "center",
              }}
            >
              This biosphere is open.
              <br />
              Give it a habit in settings, or simply be here.
            </div>
          )}
          {habits.map((h, i) => {
            const run = runs[h.id];
            const left = run ? Math.max(0, run.end - Date.now()) : 0;
            return (
              <div
                key={h.id}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTimer(h);
                }}
                style={{
                  textAlign: "center",
                  cursor: h.timer ? "pointer" : "default",
                  animation: "bsFloat " + (7 + i * 1.7) + "s ease-in-out " + i * 1.2 + "s infinite",
                  maxWidth: 440,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={{ color: A.accent, opacity: 0.9, display: "inline-flex" }}>
                    <Ic name={iconOf(bio.archetype)} size={13} />
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 300,
                      letterSpacing: "0.02em",
                      color: "rgba(255,255,255,0.94)",
                      textShadow: "0 1px 18px rgba(0,0,0,0.55)",
                    }}
                  >
                    {h.name}
                  </span>
                </div>
                {h.timer && !run && !doneT[h.id] && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      fontSize: 11,
                      letterSpacing: "0.18em",
                      marginTop: 6,
                      color: "rgba(255,255,255,0.55)",
                    }}
                  >
                    <Ic name="clock" size={11} /> {h.timer} MIN — TAP TO BEGIN
                  </div>
                )}
                {run && (
                  <div style={{ marginTop: 7 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontVariantNumeric: "tabular-nums",
                        color: A.soft,
                        letterSpacing: "0.12em",
                      }}
                    >
                      {msFmt(left)}
                    </div>
                    <div
                      style={{
                        height: 2,
                        width: 150,
                        margin: "6px auto 0",
                        background: "rgba(255,255,255,0.15)",
                        borderRadius: 2,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: 100 * (1 - left / run.total) + "%",
                          background: A.accent,
                          borderRadius: 2,
                          transition: "width .5s linear",
                        }}
                      />
                    </div>
                  </div>
                )}
                {doneT[h.id] && (
                  <div style={{ fontSize: 11.5, letterSpacing: "0.24em", marginTop: 6, color: A.accent }}>
                    COMPLETE ✦
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div
          style={{
            textAlign: "center",
            paddingBottom: "calc(22px + var(--sab))",
            fontSize: 11,
            letterSpacing: "0.26em",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          {isNow ? "UNTIL " + fmtTime(end).toUpperCase() : "A QUIET WINDOW"}
        </div>
      </div>
    </div>
  );
}
