import React, { useState, useEffect, useRef } from "react";
import { ARCH, ARCH_KEYS } from "../domain/constants";
import { t2m } from "../domain/time";
import { uid } from "../domain/uid";
import type { Biosphere, Habit } from "../domain/types";
import { Ic } from "../ui/Ic";
import { SectionLabel } from "../ui/SectionLabel";
import { Shell } from "../ui/Shell";
import { glassCard } from "../ui/style";

/* ========================================================================== */
/*  SETTINGS — the only backstage in the whole world                          */
/* ========================================================================== */

export function SettingsView({
  bios,
  setBios,
  habits,
  setHabits,
  nightStart,
  setNightStart,
  soundOn,
  onToggleSound,
  volume,
  onVolume,
  notify,
  onReset,
  currentArch,
  onBack,
}: {
  bios: Biosphere[];
  setBios: React.Dispatch<React.SetStateAction<Biosphere[]>>;
  habits: Habit[];
  setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
  nightStart: string;
  setNightStart: (t: string) => void;
  soundOn: boolean;
  onToggleSound: () => void;
  volume: number;
  onVolume: (v: number) => void;
  notify: (msg: string) => void;
  onReset: () => void;
  currentArch: string;
  onBack: () => void;
}) {
  const updBio = (id: string, patch: Partial<Biosphere>) =>
    setBios((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const updHabit = (id: string, patch: Partial<Habit>) =>
    setHabits((hs) => hs.map((h) => (h.id === id ? { ...h, ...patch } : h)));

  const delBio = (id: string) => {
    if (bios.length <= 1) {
      notify("Keep at least one biosphere");
      return;
    }
    const target = bios.find((x) => x.id !== id);
    if (!target) return;
    const moved = habits.filter((h) => h.biosphereId === id).length;
    if (moved)
      setHabits((hs) => hs.map((h) => (h.biosphereId === id ? { ...h, biosphereId: target.id } : h)));
    setBios((bs) => bs.filter((b) => b.id !== id));
    notify(
      moved
        ? moved + (moved === 1 ? " habit moved to " : " habits moved to ") + target.name
        : "Biosphere removed"
    );
  };
  const addBio = () =>
    setBios((bs) => [
      ...bs,
      { id: uid(), name: "New Biosphere", archetype: "forest", start: "17:00", purpose: "" },
    ]);

  const delHabit = (id: string) => setHabits((hs) => hs.filter((h) => h.id !== id));
  const addHabit = () => {
    const first = [...bios].sort((a, b) => t2m(a.start) - t2m(b.start))[0];
    setHabits((hs) => [...hs, { id: uid(), name: "New habit", biosphereId: first.id, timer: null }]);
  };

  // two-step reset: arm, then confirm within 3 s
  const [armed, setArmed] = useState(false);
  const armT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(armT.current), []);
  const reset = () => {
    if (!armed) {
      setArmed(true);
      clearTimeout(armT.current);
      armT.current = setTimeout(() => setArmed(false), 3000);
      return;
    }
    clearTimeout(armT.current);
    setArmed(false);
    onReset();
  };

  const cap: React.CSSProperties = {
    fontSize: 12.5,
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.5)",
    marginTop: 10,
  };
  const nightClash = bios.some((b) => t2m(b.start) >= t2m(nightStart));

  return (
    <Shell kind={currentArch} title="Settings" sub="shape your day" onBack={onBack}>
      <SectionLabel>sound</SectionLabel>
      <div style={{ ...glassCard }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15 }}>Ambient sound</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              synthesized live, scene by scene
            </div>
          </div>
          <button
            onClick={onToggleSound}
            aria-pressed={soundOn}
            aria-label="Toggle ambient sound"
            style={{
              width: 46,
              height: 26,
              borderRadius: 999,
              flex: "none",
              padding: 0,
              cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.25)",
              position: "relative",
              background: soundOn ? "rgba(159,216,232,0.85)" : "rgba(255,255,255,0.08)",
              transition: "background .25s",
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 2,
                left: soundOn ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#f2f4f7",
                transition: "left .25s",
              }}
            />
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <Ic name="mute" size={15} style={{ opacity: 0.5, flex: "none" }} />
          <input
            type="range"
            className="bsRange"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => onVolume(parseFloat(e.target.value))}
            aria-label="Volume"
            style={{ flex: 1 }}
          />
          <Ic name="sound" size={15} style={{ opacity: 0.8, flex: "none" }} />
        </div>
      </div>
      <div style={cap}>
        Every soundscape is generated live in your browser — nothing recorded, nothing downloaded.
      </div>

      <SectionLabel>biospheres</SectionLabel>
      {bios.map((b) => {
        const A = ARCH[b.archetype] || ARCH.night;
        return (
          <div key={b.id} style={{ ...glassCard, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{ width: 10, height: 10, borderRadius: "50%", background: A.accent, flex: "none" }}
              />
              <input
                className="bsInput"
                style={{ flex: 1 }}
                value={b.name}
                placeholder="Name"
                aria-label="Biosphere name"
                onChange={(e) => updBio(b.id, { name: e.target.value })}
              />
              <input
                type="time"
                className="bsInput"
                style={{ width: 112, flex: "none" }}
                value={b.start}
                aria-label="Start time"
                onChange={(e) => updBio(b.id, { start: e.target.value })}
              />
              <button
                className="bsIcon"
                title="Remove biosphere"
                aria-label="Remove biosphere"
                onClick={() => delBio(b.id)}
              >
                <Ic name="trash" size={17} />
              </button>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <input
                className="bsInput"
                style={{ flex: 1 }}
                value={b.purpose}
                placeholder="Purpose (e.g. deep focus)"
                aria-label="Purpose"
                onChange={(e) => updBio(b.id, { purpose: e.target.value })}
              />
              <select
                className="bsSelect"
                style={{ width: 128, flex: "none" }}
                value={b.archetype}
                aria-label="Scene"
                onChange={(e) => updBio(b.id, { archetype: e.target.value })}
              >
                {ARCH_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {ARCH[k].label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
      })}
      <div style={{ ...glassCard, marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{ width: 10, height: 10, borderRadius: "50%", background: ARCH.night.accent, flex: "none" }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15 }}>Grey Night</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>reflection begins</div>
        </div>
        <input
          type="time"
          className="bsInput"
          style={{ width: 112, flex: "none" }}
          value={nightStart}
          aria-label="Grey Night start"
          onChange={(e) => setNightStart(e.target.value)}
        />
      </div>
      <button
        className="bsBtn"
        onClick={addBio}
        style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
      >
        <Ic name="plus" size={15} /> Add Biosphere
      </button>
      <div style={cap}>
        Grey Night should fall after your last biosphere.
        {nightClash ? (
          <span style={{ color: "#ffcdb0" }}>
            {" "}
            Right now it doesn't — a biosphere starting at or after it will never appear as now.
          </span>
        ) : null}
      </div>

      <SectionLabel>habits</SectionLabel>
      {habits.length === 0 && (
        <div
          className="serif"
          style={{ fontStyle: "italic", color: "rgba(255,255,255,0.6)", fontSize: 16, marginBottom: 12 }}
        >
          No habits yet — plant one below.
        </div>
      )}
      {habits.map((h) => (
        <div key={h.id} style={{ ...glassCard, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              className="bsInput"
              style={{ flex: 1 }}
              value={h.name}
              placeholder="Habit"
              aria-label="Habit name"
              onChange={(e) => updHabit(h.id, { name: e.target.value })}
            />
            <button
              className="bsIcon"
              title="Remove habit"
              aria-label="Remove habit"
              onClick={() => delHabit(h.id)}
            >
              <Ic name="trash" size={17} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center" }}>
            <select
              className="bsSelect"
              style={{ flex: 1 }}
              value={h.biosphereId}
              aria-label="Biosphere"
              onChange={(e) => updHabit(h.id, { biosphereId: e.target.value })}
            >
              {bios.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="bsInput"
              style={{ width: 86, flex: "none" }}
              min={1}
              max={240}
              placeholder="—"
              value={h.timer == null ? "" : h.timer}
              aria-label="Timer minutes"
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") {
                  updHabit(h.id, { timer: null });
                  return;
                }
                const n = Math.max(1, Math.min(240, parseInt(v, 10) || 1));
                updHabit(h.id, { timer: n });
              }}
            />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", flex: "none" }}>min</span>
          </div>
        </div>
      ))}
      <button
        className="bsBtn"
        onClick={addHabit}
        style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
      >
        <Ic name="plus" size={15} /> Add Habit
      </button>

      <SectionLabel>data</SectionLabel>
      <div style={{ ...glassCard, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 170 }}>
          <div style={{ fontSize: 15 }}>Start over</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
            Restore defaults and clear the journal
          </div>
        </div>
        <button
          className="bsBtn"
          onClick={reset}
          style={armed ? { borderColor: "rgba(255,157,111,0.7)", color: "#ffcdb0" } : {}}
        >
          {armed ? "Tap again to confirm" : "Reset everything"}
        </button>
      </div>
      <div style={cap}>Your schedule, habits and journal live only in this app's private storage.</div>
    </Shell>
  );
}
