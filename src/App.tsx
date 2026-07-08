import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ARCH, DEFAULT_BIOS, DEFAULT_HABITS, DEFAULT_NIGHT_START, CONFIG_KEY, JOURNAL_KEY } from "./domain/constants";
import { t2m, dayKey } from "./domain/time";
import { computeSched } from "./domain/schedule";
import type { Biosphere, Habit, Journal, JournalEntry, ViewState } from "./domain/types";
import { store } from "./storage/adapter";
import { AUDIO } from "./audio/engine";
import { STYLE } from "./ui/style";
import { Splash } from "./ui/Splash";
import { ToastBar } from "./ui/ToastBar";
import { Handoff } from "./ui/Handoff";
import { HomeView } from "./views/HomeView";
import { ImmersionView } from "./views/ImmersionView";
import { NightView } from "./views/NightView";
import { JournalView } from "./views/JournalView";
import { StatsView } from "./views/StatsView";
import { SettingsView } from "./views/SettingsView";
import { Onboard } from "./views/Onboard";

/* ========================================================================== */
/*  APP — one day, wired together                                             */
/* ========================================================================== */

export default function App() {
  const [phase, setPhase] = useState<"boot" | "onboard" | "app">("boot");
  const [view, setView] = useState<ViewState>({ name: "home" });
  const [bios, setBios] = useState<Biosphere[]>(DEFAULT_BIOS);
  const [habits, setHabits] = useState<Habit[]>(DEFAULT_HABITS);
  const [nightStart, setNightStart] = useState(DEFAULT_NIGHT_START);
  const [journal, setJournal] = useState<Journal>({});
  const [soundOn, setSoundOn] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [now, setNow] = useState(() => new Date());
  const [toast, setToast] = useState<string | null>(null);
  const [pendingSound, setPendingSound] = useState(false);
  const [handoff, setHandoff] = useState<{ toId: string; toName: string; accent: string; until: number } | null>(null);
  const [veil, setVeil] = useState<null | "in" | "out">(null);
  const portalT = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const loaded = useRef(false);
  const toastT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const archRef = useRef("night");
  const prevCur = useRef<string | null>(null);

  const say = useCallback((msg: string) => {
    setToast(msg);
    clearTimeout(toastT.current);
    toastT.current = setTimeout(() => setToast(null), 2600);
  }, []);
  useEffect(() => () => clearTimeout(toastT.current), []);

  /* -- load persisted state (splash held >= 1100 ms) ----------------------- */
  useEffect(() => {
    let alive = true;
    const t0 = Date.now();
    Promise.all([store.get(CONFIG_KEY), store.get(JOURNAL_KEY)]).then(([cfg, jr]) => {
      const wait = Math.max(0, 1100 - (Date.now() - t0));
      setTimeout(() => {
        if (!alive) return;
        if (cfg && Array.isArray(cfg.bios) && cfg.bios.length) setBios(cfg.bios);
        if (cfg && Array.isArray(cfg.habits)) setHabits(cfg.habits);
        if (cfg && cfg.nightStart) setNightStart(cfg.nightStart);
        if (cfg && typeof cfg.volume === "number") setVolume(cfg.volume);
        if (cfg && cfg.soundPref) setPendingSound(true);
        if (jr && typeof jr === "object") setJournal(jr);
        loaded.current = true;
        setPhase(cfg && cfg.onboarded ? "app" : "onboard");
      }, wait);
    });
    return () => { alive = false; };
  }, []);

  /* -- persist config, debounced ------------------------------------------ */
  useEffect(() => {
    if (!loaded.current || phase !== "app") return;
    const id = setTimeout(() => {
      store.set(CONFIG_KEY, { onboarded: true, bios, habits, nightStart, volume, soundPref: soundOn });
    }, 700);
    return () => clearTimeout(id);
  }, [bios, habits, nightStart, volume, soundOn, phase]);

  /* -- the wall clock ------------------------------------------------------ */
  useEffect(() => {
    const iv = setInterval(() => setNow(new Date()), 20000);
    return () => clearInterval(iv);
  }, []);

  /* -- schedule resolution (FEATURE_SPEC §2, domain/schedule.ts) ------------ */
  const sorted = useMemo(() => [...bios].sort((a, b) => t2m(a.start) - t2m(b.start)), [bios]);

  const sched = useMemo(() => computeSched(sorted, nightStart, now), [sorted, nightStart, now]);

  const curBio = sched.currentId === "night" ? null : sorted.find((b) => b.id === sched.currentId);
  const currentArch = curBio ? curBio.archetype : "night";
  const viewBio = view.name === "immersion" ? bios.find((b) => b.id === view.id) : null;
  const desiredArch = view.name === "night" ? "night" : viewBio ? viewBio.archetype : currentArch;

  /* -- audio follows the world -------------------------------------------- */
  useEffect(() => {
    archRef.current = desiredArch;
    AUDIO.play(desiredArch);
  }, [desiredArch]);

  useEffect(() => { AUDIO.setVolume(volume); }, [volume]);

  useEffect(() => () => AUDIO.stop(), []);

  /* -- restore saved sound preference on the first touch ------------------- */
  useEffect(() => {
    if (!pendingSound || phase !== "app") return;
    const fire = () => {
      setPendingSound(false);
      setSoundOn(true);
      AUDIO.setEnabled(true);
      AUDIO.play(archRef.current);
    };
    window.addEventListener("pointerdown", fire, { once: true });
    return () => window.removeEventListener("pointerdown", fire);
  }, [pendingSound, phase]);

  /* -- announce phase changes gently; offer passage when immersed ----------- */
  useEffect(() => {
    if (phase !== "app") return;
    if (prevCur.current === null) { prevCur.current = sched.currentId; return; }
    if (prevCur.current === sched.currentId) return;
    const fromId = prevCur.current;
    prevCur.current = sched.currentId;
    const b = sorted.find((x) => x.id === sched.currentId);
    const toName = b ? b.name : "Grey Night";
    AUDIO.chime();
    if (view.name === "immersion" && view.id === fromId) {
      const accent = (b ? ARCH[b.archetype] || ARCH.night : ARCH.night).accent;
      setHandoff({ toId: sched.currentId, toName: toName, accent: accent, until: Date.now() + 10000 });
    } else {
      say(toName + " begins");
    }
  }, [sched.currentId, phase, sorted, say, view]);

  /* -- the passage: dim to black, cross, emerge ------------------------------ */
  const crossInto = useCallback((toId: string) => {
    setHandoff(null);
    portalT.current.forEach((id) => clearTimeout(id));
    portalT.current = [];
    setVeil("in");
    portalT.current.push(setTimeout(() => {
      setView(toId === "night" ? { name: "night" } : { name: "immersion", id: toId });
      setVeil("out");
      portalT.current.push(setTimeout(() => setVeil(null), 1250));
    }, 950));
  }, []);

  // the countdown completes the passage on its own
  useEffect(() => {
    if (!handoff) return;
    const id = setTimeout(() => crossInto(handoff.toId), Math.max(0, handoff.until - Date.now()));
    return () => clearTimeout(id);
  }, [handoff, crossInto]);

  // navigating anywhere cancels a pending passage
  useEffect(() => { setHandoff(null); }, [view]);

  useEffect(() => () => { portalT.current.forEach((id) => clearTimeout(id)); }, []);

  /* -- handlers ------------------------------------------------------------ */
  const toggleSound = useCallback(() => {
    if (!AUDIO.supported()) { say("Audio isn't available in this browser"); return; }
    setPendingSound(false);
    const nv = !soundOn;
    setSoundOn(nv);
    AUDIO.setEnabled(nv);
    if (nv) AUDIO.play(archRef.current);
  }, [soundOn, say]);

  const sealDay = useCallback((entries: Record<string, JournalEntry>) => {
    const k = dayKey(now);
    setJournal((j) => {
      const nj = { ...j, [k]: { sealedAt: Date.now(), entries: entries } };
      store.set(JOURNAL_KEY, nj);
      return nj;
    });
    say("Day sealed ✦");
  }, [now, say]);

  const enterApp = useCallback((withSound: boolean) => {
    if (withSound && AUDIO.supported()) {
      setSoundOn(true);
      AUDIO.setEnabled(true);
      AUDIO.play(archRef.current);
    }
    setPendingSound(false);
    setPhase("app");
  }, []);

  const doReset = useCallback(() => {
    setBios(DEFAULT_BIOS.map((b) => ({ ...b })));
    setHabits(DEFAULT_HABITS.map((h) => ({ ...h })));
    setNightStart(DEFAULT_NIGHT_START);
    setJournal({});
    setVolume(0.7);
    setSoundOn(false);
    setPendingSound(false);
    AUDIO.setEnabled(false);
    store.set(CONFIG_KEY, { onboarded: false });
    store.set(JOURNAL_KEY, {});
    prevCur.current = null;
    setView({ name: "home" });
    setPhase("onboard");
    say("Everything reset");
  }, [say]);

  /* -- routing (no setState in render; missing bio falls back to home) ------ */
  let body = null;
  if (phase === "app") {
    if (view.name === "immersion" && viewBio) {
      body = (
        <ImmersionView
          key={viewBio.id}
          bio={viewBio}
          end={sched.endOf(viewBio.id)}
          isNow={sched.currentId === viewBio.id}
          habits={habits.filter((h) => h.biosphereId === viewBio.id)}
          soundOn={soundOn}
          onToggleSound={toggleSound}
          onExit={() => setView({ name: "home" })}
        />
      );
    } else if (view.name === "night") {
      body = (
        <NightView
          bios={bios} habits={habits} journal={journal} now={now}
          soundOn={soundOn} onToggleSound={toggleSound}
          onSeal={sealDay} onExit={() => setView({ name: "home" })}
        />
      );
    } else if (view.name === "journal") {
      body = <JournalView journal={journal} onBack={() => setView({ name: "home" })} />;
    } else if (view.name === "stats") {
      body = (
        <StatsView
          habits={habits} bios={bios} journal={journal} now={now}
          currentArch={currentArch} onBack={() => setView({ name: "home" })}
        />
      );
    } else if (view.name === "settings") {
      body = (
        <SettingsView
          bios={bios} setBios={setBios}
          habits={habits} setHabits={setHabits}
          nightStart={nightStart} setNightStart={setNightStart}
          soundOn={soundOn} onToggleSound={toggleSound}
          volume={volume} onVolume={setVolume}
          notify={say} onReset={doReset}
          currentArch={currentArch} onBack={() => setView({ name: "home" })}
        />
      );
    } else {
      body = (
        <HomeView
          sorted={sorted} habits={habits} journal={journal} now={now}
          sched={sched} nightStart={nightStart}
          soundOn={soundOn} onToggleSound={toggleSound}
          onOpen={setView} currentArch={currentArch}
        />
      );
    }
  }

  return (
    <>
      <style>{STYLE}</style>
      {phase === "boot" && <Splash />}
      {phase === "onboard" && <Onboard onEnter={enterApp} />}
      {body}
      {handoff && (
        <Handoff
          label={handoff.toName}
          accent={handoff.accent}
          until={handoff.until}
          total={10000}
          onCross={() => crossInto(handoff.toId)}
          onRemain={() => { setHandoff(null); say("Staying a while"); }}
        />
      )}
      {veil && (
        <div
          aria-hidden="true"
          style={{
            position: "fixed", inset: 0, background: "#04060a", zIndex: 58,
            pointerEvents: veil === "in" ? "auto" : "none",
            animation: veil === "in" ? "bsVeilIn .95s ease both" : "bsVeilOut 1.25s ease both",
          }}
        />
      )}
      {toast && <ToastBar msg={toast} />}
    </>
  );
}
