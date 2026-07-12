import React from "react";
import { ARCH, iconOf } from "../domain/constants";
import { t2m, fmtTime, fmtDate, dayKey } from "../domain/time";
import type { Sched } from "../domain/schedule";
import type { Biosphere, Habit, Journal, ViewState } from "../domain/types";
import { SceneCanvas } from "../scenes/SceneCanvas";
import { Ic } from "../ui/Ic";

/* ========================================================================== */
/*  HOME — the day's biospheres, in order, behind glass                       */
/* ========================================================================== */

function BioTile({
  bio,
  state,
  hb,
  onOpen,
}: {
  bio: Biosphere;
  state: "now" | "past" | "next";
  hb: Habit[];
  onOpen: () => void;
}) {
  const A = ARCH[bio.archetype] || ARCH.night;
  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onOpen();
      }}
      style={{
        position: "relative",
        borderRadius: 22,
        overflow: "hidden",
        cursor: "pointer",
        marginBottom: 14,
        border: state === "now" ? "1px solid " + A.accent + "66" : "1px solid rgba(255,255,255,0.09)",
        boxShadow: state === "now" ? "0 10px 46px -10px " + A.glow : "0 4px 22px -12px rgba(0,0,0,0.65)",
        opacity: state === "past" ? 0.62 : 1,
        transition: "opacity .5s, box-shadow .5s, border-color .5s",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: A.css,
          filter: state === "past" ? "saturate(0.55) brightness(0.82)" : "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: -40,
          background: "radial-gradient(circle at 78% 28%, " + A.glow + ", transparent 62%)",
          opacity: 0.5,
          animation: "bsDrift 11s ease-in-out infinite",
        }}
      />
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 22 + i * 26 + "%",
            top: 28 + i * 16 + "%",
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: A.soft,
            opacity: 0.5,
            animation: "bsTileFloat " + (6 + i * 2.3) + "s ease-in-out " + i * 1.4 + "s infinite",
          }}
        />
      ))}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(90deg, rgba(4,7,10,0.55), rgba(4,7,10,0.15) 60%, rgba(4,7,10,0.35))",
        }}
      />
      <div
        style={{
          position: "relative",
          padding: "17px 18px 15px",
          display: "flex",
          alignItems: "center",
          gap: 14,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 12,
              letterSpacing: "0.18em",
              color: "rgba(255,255,255,0.75)",
            }}
          >
            <span>{fmtTime(bio.start)}</span>
            {state === "now" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: A.accent }}>
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: A.accent,
                    animation: "bsBreathe 2.6s ease-in-out infinite",
                  }}
                />
                NOW
              </span>
            )}
            {state === "past" && <span style={{ opacity: 0.6, letterSpacing: "0.14em" }}>passed</span>}
          </div>
          <div
            className="serif"
            style={{ fontSize: 27, fontWeight: 500, letterSpacing: "0.04em", marginTop: 2 }}
          >
            {bio.name}
          </div>
          <div
            className="serif"
            style={{ fontStyle: "italic", fontSize: 14.5, color: "rgba(255,255,255,0.72)" }}
          >
            {bio.purpose || A.tagline}
          </div>
          <div
            style={{
              marginTop: 8,
              fontSize: 12.5,
              color: "rgba(255,255,255,0.6)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {hb.length ? hb.map((h) => h.name).join("  ·  ") : "an open window — no habits yet"}
          </div>
        </div>
        <div
          style={{
            color: A.accent,
            opacity: 0.92,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            flex: "none",
          }}
        >
          <Ic name={iconOf(bio.archetype)} size={26} />
          <Ic name="chev" size={15} style={{ opacity: 0.6 }} />
        </div>
      </div>
    </div>
  );
}

export function HomeView({
  sorted,
  habits,
  journal,
  now,
  sched,
  nightStart,
  soundOn,
  onToggleSound,
  onOpen,
  currentArch,
}: {
  sorted: Biosphere[];
  habits: Habit[];
  journal: Journal;
  now: Date;
  sched: Sched;
  nightStart: string;
  soundOn: boolean;
  onToggleSound: () => void;
  onOpen: (view: ViewState) => void;
  currentArch: string;
}) {
  const isNightNow = sched.currentId === "night";
  const cur = isNightNow ? null : sorted.find((b) => b.id === sched.currentId);
  const A = ARCH[currentArch] || ARCH.night;
  const nMin = now.getHours() * 60 + now.getMinutes();
  const preDawn = isNightNow && sorted.length > 0 && nMin < t2m(sorted[0].start) && nMin >= 240;
  const sealed = journal[dayKey(now)];
  const doneCount = sealed ? Object.values(sealed.entries || {}).filter((e) => e.done).length : 0;
  const totalCount = sealed ? Object.keys(sealed.entries || {}).length : habits.length;
  const nightState = sealed ? "done" : isNightNow && !preDawn ? "now" : "later";
  const AN = ARCH.night;
  const stateOf = (b: Biosphere): "now" | "past" | "next" => {
    if (sched.currentId === b.id) return "now";
    if (isNightNow) return preDawn ? "next" : "past";
    const curStart = cur ? t2m(cur.start) : 0;
    return t2m(b.start) < curStart ? "past" : "next";
  };

  return (
    <div className="bsRoot">
      <div key={currentArch} className="fadeSlow" style={{ position: "absolute", inset: 0 }}>
        <SceneCanvas kind={currentArch} />
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(4,7,11,0.68), rgba(4,7,11,0.44) 34%, rgba(4,7,11,0.72))",
        }}
      />
      <div className="bsScroll" style={{ position: "relative" }}>
        <div className="fadeIn" style={{ maxWidth: 560, margin: "0 auto", padding: "26px 20px 64px" }}>
          <div
            style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 300, letterSpacing: "0.42em", fontSize: 15 }}>BIOSPHERE</div>
              <div
                className="serif"
                style={{ fontStyle: "italic", fontSize: 15, color: "rgba(255,255,255,0.65)", marginTop: 5 }}
              >
                {fmtDate(now)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flex: "none" }}>
              <button
                className="bsIcon"
                title="Ambient sound"
                aria-label="Toggle sound"
                onClick={onToggleSound}
              >
                <Ic name={soundOn ? "sound" : "mute"} size={18} />
              </button>
              <button
                className="bsIcon"
                title="Stillness — streaks"
                aria-label="Streaks"
                onClick={() => onOpen({ name: "stats" })}
              >
                <Ic name="sprout" size={18} />
              </button>
              <button
                className="bsIcon"
                title="Journal"
                aria-label="Journal"
                onClick={() => onOpen({ name: "journal" })}
              >
                <Ic name="book" size={18} />
              </button>
              <button
                className="bsIcon"
                title="Settings"
                aria-label="Settings"
                onClick={() => onOpen({ name: "settings" })}
              >
                <Ic name="gear" size={18} />
              </button>
            </div>
          </div>

          <div style={{ margin: "30px 0 26px" }}>
            {preDawn ? (
              <div>
                <div className="serif" style={{ fontSize: 33, fontStyle: "italic", fontWeight: 500 }}>
                  Before the day
                </div>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: ARCH[sorted[0].archetype].accent,
                    marginTop: 7,
                  }}
                >
                  {sorted[0].name} opens at {fmtTime(sorted[0].start)}
                </div>
              </div>
            ) : (
              <div>
                <div className="serif" style={{ fontSize: 33, fontStyle: "italic", fontWeight: 500 }}>
                  {cur ? cur.name : "Grey Night"}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: A.accent,
                    marginTop: 7,
                  }}
                >
                  now · {cur ? cur.purpose || ARCH[cur.archetype].tagline : "reflection & rest"}
                  {cur ? " · until " + fmtTime(sched.endOf(cur.id)) : ""}
                </div>
              </div>
            )}
          </div>

          {sorted.map((b) => (
            <BioTile
              key={b.id}
              bio={b}
              hb={habits.filter((h) => h.biosphereId === b.id)}
              state={stateOf(b)}
              onOpen={() => onOpen({ name: "immersion", id: b.id })}
            />
          ))}

          {/* grey night tile */}
          <div
            onClick={() => onOpen({ name: "night" })}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onOpen({ name: "night" });
            }}
            style={{
              position: "relative",
              borderRadius: 22,
              overflow: "hidden",
              cursor: "pointer",
              border:
                nightState === "now" ? "1px solid " + AN.accent + "66" : "1px solid rgba(255,255,255,0.09)",
              boxShadow:
                nightState === "now" ? "0 10px 46px -10px " + AN.glow : "0 4px 22px -12px rgba(0,0,0,0.65)",
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: AN.css }} />
            <div
              style={{
                position: "absolute",
                inset: -40,
                background: "radial-gradient(circle at 74% 26%, " + AN.glow + ", transparent 60%)",
                opacity: 0.5,
              }}
            />
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: 14 + i * 22 + "%",
                  top: 24 + (i % 2) * 30 + "%",
                  width: 2,
                  height: 2,
                  borderRadius: "50%",
                  background: "#dfe6f2",
                  opacity: 0.55,
                  animation: "bsTileFloat " + (7 + i * 1.7) + "s ease-in-out " + i + "s infinite",
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, rgba(3,5,9,0.5), rgba(3,5,9,0.1) 60%, rgba(3,5,9,0.3))",
              }}
            />
            <div
              style={{
                position: "relative",
                padding: "17px 18px 15px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    fontSize: 12,
                    letterSpacing: "0.18em",
                    color: "rgba(255,255,255,0.75)",
                  }}
                >
                  <span>{fmtTime(nightStart)}</span>
                  {nightState === "now" && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: AN.accent }}>
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: AN.accent,
                          animation: "bsBreathe 2.6s ease-in-out infinite",
                        }}
                      />
                      NOW
                    </span>
                  )}
                </div>
                <div
                  className="serif"
                  style={{ fontSize: 27, fontWeight: 500, letterSpacing: "0.04em", marginTop: 2 }}
                >
                  Grey Night
                </div>
                <div
                  className="serif"
                  style={{ fontStyle: "italic", fontSize: 14.5, color: "rgba(255,255,255,0.72)" }}
                >
                  {sealed
                    ? "reflected — " + doneCount + " of " + totalCount + " fulfilled"
                    : nightState === "now"
                      ? "the day settles — enter to reflect"
                      : "nightly reflection, one habit at a time"}
                </div>
              </div>
              <div
                style={{
                  color: AN.accent,
                  opacity: 0.92,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                  flex: "none",
                }}
              >
                <Ic name="moon" size={24} />
                <Ic name="chev" size={15} style={{ opacity: 0.6 }} />
              </div>
            </div>
          </div>

          <div
            className="serif"
            style={{
              textAlign: "center",
              fontStyle: "italic",
              fontSize: 13.5,
              color: "rgba(255,255,255,0.4)",
              marginTop: 34,
            }}
          >
            Step through the day, one biosphere at a time.
          </div>
        </div>
      </div>
    </div>
  );
}
