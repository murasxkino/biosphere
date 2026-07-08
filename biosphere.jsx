// ============================================================================
//  B I O S P H E R E  —  one day, lived in nature.
//
//  An immersive, nature-based habit companion.
//  · Your day unfolds through timed Biospheres (Tundra, Volcanic, Seaside,
//    Forest, Mountain), each a full-screen living scene with its own
//    procedurally generated soundscape (Web Audio — nothing downloaded).
//  · Habits live quietly inside each Biosphere. No checkboxes by day.
//  · When the Grey Night falls, you reflect on each habit, one at a time,
//    in a typed journal. Streaks grow silently.
//  · Schedule, habits, journal persist privately via window.storage.
// ============================================================================

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";

/* ------------------------------ archetypes ------------------------------- */

const ARCH = {
  tundra: {
    label: "Tundra", tagline: "deep focus",
    accent: "#9fd8e8", soft: "#e6f6fa", glow: "rgba(140,214,232,0.5)",
    css: "linear-gradient(178deg,#0a141d 0%,#123040 52%,#28505f 100%)",
    icon: "snow",
  },
  volcanic: {
    label: "Volcanic", tagline: "strenuous & vital",
    accent: "#ff9d6f", soft: "#ffe3d1", glow: "rgba(255,122,66,0.45)",
    css: "linear-gradient(178deg,#0c0507 0%,#230a0c 55%,#3d1410 100%)",
    icon: "volcano",
  },
  seaside: {
    label: "Seaside", tagline: "rest & restoration",
    accent: "#a5dee6", soft: "#eafbfd", glow: "rgba(150,220,230,0.45)",
    css: "linear-gradient(178deg,#16333f 0%,#3f7186 46%,#0e2a35 100%)",
    icon: "wave",
  },
  forest: {
    label: "Forest", tagline: "social & emotional",
    accent: "#b9e39a", soft: "#eef9df", glow: "rgba(170,224,140,0.4)",
    css: "linear-gradient(178deg,#09140c 0%,#173822 55%,#0e2415 100%)",
    icon: "tree",
  },
  mountain: {
    label: "Mountain", tagline: "spiritual practice",
    accent: "#cfc0f2", soft: "#f1ecfd", glow: "rgba(190,170,240,0.4)",
    css: "linear-gradient(178deg,#151027 0%,#2c2150 55%,#4a3670 100%)",
    icon: "peaks",
  },
  night: {
    label: "Grey Night", tagline: "reflection",
    accent: "#a9b4cd", soft: "#e9edf6", glow: "rgba(160,175,205,0.35)",
    css: "linear-gradient(178deg,#07090f 0%,#10151f 60%,#1a2230 100%)",
    icon: "moon",
  },
};
const ARCH_KEYS = ["tundra", "volcanic", "seaside", "forest", "mountain"];
const iconOf = (a) => (ARCH[a] || ARCH.night).icon;

/* ------------------------------- defaults -------------------------------- */

const DEFAULT_BIOS = [
  { id: "b_tundra",   name: "Tundra",   archetype: "tundra",   start: "09:00", purpose: "Deep focus" },
  { id: "b_volcanic", name: "Volcanic", archetype: "volcanic", start: "11:30", purpose: "Strenuous & crucial" },
  { id: "b_seaside",  name: "Seaside",  archetype: "seaside",  start: "13:00", purpose: "Rest & restoration" },
  { id: "b_forest",   name: "Forest",   archetype: "forest",   start: "15:30", purpose: "Social & emotional" },
  { id: "b_mountain", name: "Mountain", archetype: "mountain", start: "19:00", purpose: "Spiritual practice" },
];

const DEFAULT_HABITS = [
  { id: "h_deep",   name: "One deep work block",   biosphereId: "b_tundra",   timer: 50 },
  { id: "h_move",   name: "Move your body",        biosphereId: "b_volcanic", timer: 30 },
  { id: "h_rest",   name: "Rest, unplugged",       biosphereId: "b_seaside",  timer: 20 },
  { id: "h_reach",  name: "Reach out to someone",  biosphereId: "b_forest",   timer: null },
  { id: "h_still",  name: "Evening stillness",     biosphereId: "b_mountain", timer: 10 },
];

const DEFAULT_NIGHT_START = "21:30";

const CONFIG_KEY  = "biosphere-config-v1";
const JOURNAL_KEY = "biosphere-journal-v1";

/* --------------------------------- utils --------------------------------- */

const uid = () => Math.random().toString(36).slice(2, 10);

const t2m = (t) => {
  const p = String(t || "00:00").split(":");
  return (parseInt(p[0], 10) || 0) * 60 + (parseInt(p[1], 10) || 0);
};

const fmtTime = (t) => {
  const p = String(t || "00:00").split(":");
  const d = new Date();
  d.setHours(parseInt(p[0], 10) || 0, parseInt(p[1], 10) || 0, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

const fmtDate = (d) =>
  d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

const localKey = (x) =>
  x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");

// A "day" rolls over at 4 AM, so a reflection finished after midnight
// still belongs to the day you actually lived.
const dayKey = (d = new Date()) => {
  const x = new Date(d);
  if (x.getHours() < 4) x.setDate(x.getDate() - 1);
  return localKey(x);
};

const prevKey = (k) => {
  const p = k.split("-").map(Number);
  const d = new Date(p[0], p[1] - 1, p[2]);
  d.setDate(d.getDate() - 1);
  return localKey(d);
};

const fmtDayKey = (k) => {
  const p = k.split("-").map(Number);
  return new Date(p[0], p[1] - 1, p[2]).toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
  });
};

const msFmt = (ms) => {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
};

const lastNDays = (n, todayK) => {
  const arr = [];
  let k = todayK;
  for (let i = 0; i < n; i++) { arr.unshift(k); k = prevKey(k); }
  return arr;
};

const habitSeries = (journal, habitId) => {
  const m = {};
  Object.keys(journal).forEach((k) => {
    const e = journal[k] && journal[k].entries ? journal[k].entries[habitId] : null;
    if (e && e.done !== undefined) m[k] = !!e.done;
  });
  return m;
};

const calcStreak = (series, todayK) => {
  let k = todayK;
  if (series[k] === undefined) k = prevKey(todayK);
  let s = 0;
  while (series[k] === true) { s++; k = prevKey(k); }
  return s;
};

const calcBest = (series) => {
  const keys = Object.keys(series).filter((k) => series[k]).sort();
  let best = 0, run = 0, prev = null;
  keys.forEach((k) => {
    run = prev && prevKey(k) === prev ? run + 1 : 1;
    if (run > best) best = run;
    prev = k;
  });
  return best;
};

/* ---------------------- persistent storage (private) --------------------- */

const memFallback = {};
const store = {
  async get(k) {
    try {
      if (typeof window === "undefined" || !window.storage) return memFallback[k] || null;
      const r = await window.storage.get(k);
      return r && r.value ? JSON.parse(r.value) : null;
    } catch (e) { return null; }
  },
  async set(k, v) {
    try {
      memFallback[k] = v;
      if (typeof window === "undefined" || !window.storage) return;
      await window.storage.set(k, JSON.stringify(v));
    } catch (e) { /* keep in-memory copy */ }
  },
};

/* ========================================================================== */
/*  PROCEDURAL SOUND ENGINE — every soundscape is synthesized live            */
/*  (filtered noise, oscillators, envelopes). Nothing recorded or fetched.    */
/* ========================================================================== */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = false;
    this.volume = 0.7;
    this.sceneName = null;
    this.current = null;
    this.buffers = {};
  }

  supported() {
    return typeof window !== "undefined" && !!(window.AudioContext || window.webkitAudioContext);
  }

  ensure() {
    if (!this.supported()) return false;
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.enabled ? this.volume : 0;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") { try { this.ctx.resume(); } catch (e) {} }
    return true;
  }

  noise(type) {
    if (this.buffers[type]) return this.buffers[type];
    const ctx = this.ctx;
    const len = Math.floor(ctx.sampleRate * 2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    if (type === "white") {
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } else if (type === "pink") {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179;
        b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852;
        b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522;
        b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    } else { // brown
      let last = 0;
      for (let i = 0; i < len; i++) {
        const w = Math.random() * 2 - 1;
        last = (last + 0.02 * w) / 1.02;
        d[i] = last * 3.2;
      }
    }
    this.buffers[type] = buf;
    return buf;
  }

  setVolume(v) {
    this.volume = v;
    if (this.ctx && this.enabled) this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.15);
  }

  setEnabled(on) {
    this.enabled = on;
    if (!this.ensure()) return;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setTargetAtTime(on ? this.volume : 0, t, 0.3);
    if (on) {
      if (this.sceneName && (!this.current || this.current.name !== this.sceneName)) {
        this._fadeOut(this.current);
        this.current = this._build(this.sceneName);
      }
    } else {
      this._fadeOut(this.current);
      this.current = null;
    }
  }

  play(name) {
    this.sceneName = name;
    if (!this.enabled) return;
    if (!this.ensure()) return;
    if (this.current && this.current.name === name) return;
    this._fadeOut(this.current);
    this.current = this._build(name);
  }

  stop() {
    this.sceneName = null;
    this._fadeOut(this.current);
    this.current = null;
  }

  chime() {
    if (!this.enabled || !this.ensure()) return;
    const ctx = this.ctx;
    const t = ctx.currentTime + 0.02;
    const notes = [[659.25, 0], [880, 0.22]];
    for (let i = 0; i < notes.length; i++) {
      const f = notes[i][0], off = notes[i][1];
      const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = f;
      const g = ctx.createGain(); o.connect(g); g.connect(this.master);
      g.gain.setValueAtTime(0.0001, t + off);
      g.gain.linearRampToValueAtTime(0.1, t + off + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + off + 1.4);
      o.start(t + off); o.stop(t + off + 1.6);
    }
  }

  /* ------------------------------ internals ------------------------------ */

  _fadeOut(cur) {
    if (!cur) return;
    const t = this.ctx.currentTime;
    try {
      cur.gain.gain.cancelScheduledValues(t);
      cur.gain.gain.setTargetAtTime(0, t, 0.5);
    } catch (e) {}
    cur.timers.forEach((id) => clearTimeout(id));
    cur.timers.length = 0;
    setTimeout(() => {
      cur.stops.forEach((f) => { try { f(); } catch (e) {} });
      try { cur.gain.disconnect(); } catch (e) {}
    }, 1800);
  }

  _build(name) {
    const ctx = this.ctx;
    const g = ctx.createGain();
    g.gain.value = 0;
    g.connect(this.master);
    const scene = { name: name, gain: g, stops: [], timers: [] };
    const fn = this["_" + name];
    (fn || this._night).call(this, scene);
    g.gain.setTargetAtTime(1, ctx.currentTime + 0.05, 0.9);
    return scene;
  }

  _src(scene, buffer) {
    const s = this.ctx.createBufferSource();
    s.buffer = buffer; s.loop = true; s.start();
    scene.stops.push(() => s.stop());
    return s;
  }

  _lfo(scene, rate, depth, base, param) {
    const o = this.ctx.createOscillator();
    o.frequency.value = rate;
    const g = this.ctx.createGain();
    g.gain.value = depth;
    o.connect(g); g.connect(param);
    param.value = base;
    o.start();
    scene.stops.push(() => o.stop());
  }

  _every(scene, minS, maxS, fn) {
    const self = this;
    const loop = () => {
      const id = setTimeout(() => {
        if (self.enabled) { try { fn(); } catch (e) {} }
        loop();
      }, (minS + Math.random() * (maxS - minS)) * 1000);
      scene.timers.push(id);
    };
    loop();
  }

  _pan(scene) {
    if (this.ctx.createStereoPanner) {
      const p = this.ctx.createStereoPanner();
      p.pan.value = Math.random() * 1.4 - 0.7;
      p.connect(scene.gain);
      return p;
    }
    return scene.gain;
  }

  /* ---------------------- shared texture helpers ------------------------- */

  _panTo(scene, v) {
    if (this.ctx.createStereoPanner) {
      const p = this.ctx.createStereoPanner();
      p.pan.value = v;
      p.connect(scene.gain);
      return p;
    }
    return scene.gain;
  }

  // slow random walk of an AudioParam — kills the giveaway periodicity of LFOs
  _walk(scene, param, base, spread, minS, maxS, tau) {
    param.value = base;
    const self = this;
    this._every(scene, minS, maxS, () => {
      const v = Math.max(0.0001, base + (Math.random() * 2 - 1) * spread);
      param.setTargetAtTime(v, self.ctx.currentTime, tau);
    });
  }

  // coherent gusts: several params swell and subside together, irregularly
  _gusts(scene, targets, minGap, maxGap, riseMin, riseMax, fallMin, fallMax) {
    const self = this;
    this._every(scene, minGap, maxGap, () => {
      const t = self.ctx.currentTime;
      const rise = riseMin + Math.random() * (riseMax - riseMin);
      const fall = fallMin + Math.random() * (fallMax - fallMin);
      const k = 0.5 + Math.random() * 0.5;
      for (let i = 0; i < targets.length; i++) {
        const it = targets[i];
        const peak = it.base + (it.peak - it.base) * k;
        it.p.setTargetAtTime(peak, t, rise / 3);
        it.p.setTargetAtTime(it.base, t + rise, fall / 3);
      }
    });
  }

  // one short noise event: optional bandpass sweep + shaping + envelope
  _grain(out, when, noiseType, o) {
    const ctx = this.ctx;
    const s = ctx.createBufferSource();
    s.buffer = this.noise(noiseType);
    s.loop = true;
    s.playbackRate.value = 0.85 + Math.random() * 0.3;
    let node = s;
    if (o.f0) {
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = o.q || 12;
      bp.frequency.setValueAtTime(o.f0, when);
      if (o.f1) bp.frequency.exponentialRampToValueAtTime(o.f1, when + o.dur);
      node.connect(bp); node = bp;
    }
    if (o.lp) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = o.lp; node.connect(f); node = f; }
    if (o.hp) { const f = ctx.createBiquadFilter(); f.type = "highpass"; f.frequency.value = o.hp; node.connect(f); node = f; }
    const g = ctx.createGain(); node.connect(g); g.connect(out);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(o.peak, when + Math.min(0.012, o.dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, when + o.dur);
    s.start(when, Math.random() * 1.4);
    s.stop(when + o.dur + 0.08);
  }

  // an owl — the one voice in these worlds that truly holds a pitch
  _hoot(scene, f, peak, echo) {
    const ctx = this.ctx;
    const self = this;
    const one = (t, fq, dur) => {
      const o = ctx.createOscillator(); o.type = "sine";
      o.frequency.setValueAtTime(fq, t);
      o.frequency.exponentialRampToValueAtTime(fq * 0.93, t + dur);
      const g = ctx.createGain(); o.connect(g);
      g.connect(scene.gain);
      if (echo) g.connect(echo);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t); o.stop(t + dur + 0.05);
      self._grain(scene.gain, t, "white", { f0: fq * 1.6, q: 2.5, dur: dur, peak: peak * 0.22 });
    };
    const t0 = ctx.currentTime + 0.05;
    const base = f * (0.96 + Math.random() * 0.08);
    one(t0, base, 0.3);
    one(t0 + 0.5, base * 0.96, 0.42);
  }

  /* ------------------------------ soundscapes ---------------------------- */
  /* Nature is noise, not notes. Beds are filtered noise whose parameters    */
  /* wander on random walks; events are noise-born grains; slow coherent     */
  /* gusts tie layers together. Nothing holds a steady pitch except living   */
  /* things that really do — crickets, and an owl.                           */

  _tundra(scene) {
    const ctx = this.ctx;
    // body of the wind
    const n = this._src(scene, this.noise("pink"));
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.Q.value = 0.4;
    const g = ctx.createGain(); g.gain.value = 0.16;
    n.connect(f); f.connect(g); g.connect(this._panTo(scene, -0.2));
    this._walk(scene, f.frequency, 520, 260, 1.4, 3.6, 1.1);
    // blowing snow — a high sizzle that breathes with the gusts
    const n2 = this._src(scene, this.noise("white"));
    const f2 = ctx.createBiquadFilter(); f2.type = "bandpass"; f2.Q.value = 1.1;
    const g2 = ctx.createGain(); g2.gain.value = 0.014;
    n2.connect(f2); f2.connect(g2); g2.connect(this._panTo(scene, 0.25));
    this._walk(scene, f2.frequency, 1500, 550, 1.2, 3, 0.9);
    // the whistle only rises when the wind does
    const n3 = this._src(scene, this.noise("white"));
    const f3 = ctx.createBiquadFilter(); f3.type = "bandpass"; f3.Q.value = 14;
    const g3 = ctx.createGain(); g3.gain.value = 0.003;
    n3.connect(f3); f3.connect(g3); g3.connect(scene.gain);
    this._walk(scene, f3.frequency, 1350, 550, 0.9, 2.4, 0.7);
    this._gusts(scene, [
      { p: g.gain, base: 0.16, peak: 0.4 },
      { p: g2.gain, base: 0.014, peak: 0.05 },
      { p: g3.gain, base: 0.003, peak: 0.026 },
    ], 5, 13, 1.2, 2.6, 2.6, 5.5);
  }

  _volcanic(scene) {
    const ctx = this.ctx;
    const self = this;
    // tectonic floor, breathing
    const n = this._src(scene, this.noise("brown"));
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.Q.value = 0.7;
    const g = ctx.createGain(); g.gain.value = 0.3;
    n.connect(f); f.connect(g); g.connect(scene.gain);
    this._walk(scene, f.frequency, 92, 30, 2, 5, 1.6);
    this._gusts(scene, [{ p: g.gain, base: 0.3, peak: 0.52 }], 7, 16, 1.8, 3.5, 3, 6);
    // steam vents, far right
    const n2 = this._src(scene, this.noise("white"));
    const f2 = ctx.createBiquadFilter(); f2.type = "highpass"; f2.frequency.value = 6200;
    const g2 = ctx.createGain();
    n2.connect(f2); f2.connect(g2); g2.connect(this._panTo(scene, 0.3));
    this._walk(scene, g2.gain, 0.006, 0.004, 1.5, 4, 1.2);
    // deep resonant knocks from below — rock, not tone
    this._every(scene, 9, 21, () => {
      const t = ctx.currentTime + 0.03;
      self._grain(scene.gain, t, "brown", { f0: 52 + Math.random() * 22, q: 6, dur: 0.4, peak: 0.5 });
      if (Math.random() < 0.4) self._grain(scene.gain, t + 0.25 + Math.random() * 0.3, "brown", { f0: 48 + Math.random() * 18, q: 6, dur: 0.3, peak: 0.28 });
    });
    // ember crackle — clustered, varied, the occasional deeper pop
    this._every(scene, 0.28, 0.95, () => {
      if (Math.random() < 0.35) return;
      const t0 = ctx.currentTime + 0.02;
      const count = Math.random() < 0.3 ? 2 + Math.floor(Math.random() * 3) : 1;
      const out = self._pan(scene);
      for (let i = 0; i < count; i++) {
        const t = t0 + i * (0.03 + Math.random() * 0.07);
        if (Math.random() < 0.22) self._grain(out, t, "white", { lp: 900, dur: 0.03 + Math.random() * 0.03, peak: 0.02 });
        else self._grain(out, t, "white", { hp: 2600 + Math.random() * 2600, dur: 0.01 + Math.random() * 0.035, peak: 0.006 + Math.random() * 0.014 });
      }
    });
  }

  _seaside(scene) {
    const ctx = this.ctx;
    const self = this;
    // distant surf, always there
    const n = this._src(scene, this.noise("pink"));
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.Q.value = 0.5;
    const g = ctx.createGain();
    n.connect(f); f.connect(g); g.connect(scene.gain);
    this._walk(scene, f.frequency, 320, 110, 2, 5, 1.6);
    this._walk(scene, g.gain, 0.1, 0.03, 2.5, 6, 2);
    // sea air
    const n2 = this._src(scene, this.noise("white"));
    const f2 = ctx.createBiquadFilter(); f2.type = "highpass"; f2.frequency.value = 7000;
    const g2 = ctx.createGain();
    n2.connect(f2); f2.connect(g2); g2.connect(scene.gain);
    this._walk(scene, g2.gain, 0.004, 0.0025, 2, 5, 1.5);
    // each wave: gather → break → wash, alternating across the water
    scene.side = 1;
    const wave = () => {
      const t = ctx.currentTime + 0.05;
      const k = 0.55 + Math.random() * 0.45;
      const rise = 2 + Math.random() * 1.8;
      const wash = 3 + Math.random() * 3.5;
      scene.side = -scene.side;
      const out = self._panTo(scene, scene.side * (0.15 + Math.random() * 0.25));
      const s = ctx.createBufferSource(); s.buffer = self.noise("white"); s.loop = true;
      const bf = ctx.createBiquadFilter(); bf.type = "lowpass"; bf.Q.value = 0.6;
      const bg = ctx.createGain();
      s.connect(bf); bf.connect(bg); bg.connect(out);
      bf.frequency.setValueAtTime(240, t);
      bf.frequency.exponentialRampToValueAtTime(1500, t + rise);
      bf.frequency.exponentialRampToValueAtTime(360, t + rise + wash);
      bg.gain.setValueAtTime(0.0001, t);
      bg.gain.linearRampToValueAtTime(0.26 * k, t + rise);
      bg.gain.exponentialRampToValueAtTime(0.0001, t + rise + wash);
      s.start(t, Math.random() * 1.4); s.stop(t + rise + wash + 0.1);
      const s2 = ctx.createBufferSource(); s2.buffer = self.noise("white"); s2.loop = true;
      const hf = ctx.createBiquadFilter(); hf.type = "highpass"; hf.frequency.value = 1700;
      const hg = ctx.createGain();
      s2.connect(hf); hf.connect(hg); hg.connect(out);
      hg.gain.setValueAtTime(0.0001, t + rise - 0.1);
      hg.gain.linearRampToValueAtTime(0.2 * k, t + rise + 0.12);
      hg.gain.exponentialRampToValueAtTime(0.0001, t + rise + wash * 0.9);
      s2.start(t + rise - 0.1, Math.random() * 1.4); s2.stop(t + rise + wash + 0.1);
    };
    wave();
    this._every(scene, 6, 12, wave);
    // a gull, far off, now and then
    this._every(scene, 22, 48, () => {
      if (Math.random() < 0.35) return;
      const out = self._pan(scene);
      const t = ctx.currentTime + 0.05;
      self._grain(out, t, "white", { f0: 2900, f1: 2000, q: 9, dur: 0.5, peak: 0.012 });
      self._grain(out, t + 0.6, "white", { f0: 2700, f1: 1900, q: 9, dur: 0.42, peak: 0.009 });
    });
  }

  _forest(scene) {
    const ctx = this.ctx;
    const self = this;
    // hush of the woods
    const n0 = this._src(scene, this.noise("brown"));
    const f0 = ctx.createBiquadFilter(); f0.type = "lowpass"; f0.frequency.value = 220;
    const g0 = ctx.createGain(); g0.gain.value = 0.035;
    n0.connect(f0); f0.connect(g0); g0.connect(scene.gain);
    // canopy — leaves in moving air
    const n = this._src(scene, this.noise("pink"));
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 0.8;
    const g = ctx.createGain(); g.gain.value = 0.06;
    n.connect(f); f.connect(g); g.connect(this._panTo(scene, -0.15));
    this._walk(scene, f.frequency, 1700, 700, 1.3, 3.2, 1);
    // leaf sizzle riding the gusts
    const n2 = this._src(scene, this.noise("white"));
    const f2 = ctx.createBiquadFilter(); f2.type = "highpass"; f2.frequency.value = 3200;
    const g2 = ctx.createGain(); g2.gain.value = 0.002;
    n2.connect(f2); f2.connect(g2); g2.connect(this._panTo(scene, 0.2));
    this._gusts(scene, [
      { p: g.gain, base: 0.06, peak: 0.15 },
      { p: g2.gain, base: 0.002, peak: 0.028 },
    ], 6, 14, 1.4, 2.8, 2.5, 5);
    // birdsong — noise-born chirps, phrased, placed among the trees
    const phrase = (far) => {
      const out = self._pan(scene);
      const t0 = ctx.currentTime + 0.05;
      const sp = Math.random() < 0.5 ? 0 : 1;
      const base = sp === 0 ? 2500 + Math.random() * 900 : 3700 + Math.random() * 900;
      const count = sp === 0 ? 2 + Math.floor(Math.random() * 3) : 4 + Math.floor(Math.random() * 4);
      const gap = sp === 0 ? 0.16 + Math.random() * 0.12 : 0.085 + Math.random() * 0.05;
      for (let i = 0; i < count; i++) {
        const t = t0 + i * gap * (0.9 + Math.random() * 0.25);
        const fj = base * (0.95 + Math.random() * 0.1);
        const up = sp === 1 && i % 2 === 0;
        self._grain(out, t, "white", {
          f0: up ? fj * 0.85 : fj * 1.28,
          f1: up ? fj * 1.22 : fj * 0.8,
          q: 16,
          dur: sp === 0 ? 0.08 + Math.random() * 0.05 : 0.05,
          peak: far ? 0.007 : 0.02 + Math.random() * 0.013,
          lp: far ? 2600 : 0,
        });
      }
    };
    this._every(scene, 4, 10, () => phrase(false));
    this._every(scene, 8, 19, () => phrase(true));
  }

  _mountain(scene) {
    const ctx = this.ctx;
    const self = this;
    // thin air moving over stone
    const n = this._src(scene, this.noise("pink"));
    const f = ctx.createBiquadFilter(); f.type = "bandpass"; f.Q.value = 0.6;
    const g = ctx.createGain(); g.gain.value = 0.05;
    n.connect(f); f.connect(g); g.connect(this._panTo(scene, -0.15));
    this._walk(scene, f.frequency, 750, 300, 1.6, 4, 1.3);
    // altitude sizzle
    const n2 = this._src(scene, this.noise("white"));
    const f2 = ctx.createBiquadFilter(); f2.type = "highpass"; f2.frequency.value = 4000;
    const g2 = ctx.createGain(); g2.gain.value = 0.004;
    n2.connect(f2); f2.connect(g2); g2.connect(this._panTo(scene, 0.2));
    // long alpine waves of wind
    this._gusts(scene, [
      { p: g.gain, base: 0.05, peak: 0.16 },
      { p: g2.gain, base: 0.004, peak: 0.018 },
    ], 8, 18, 2, 4, 4, 8);
    // the valley answers: a soft echo, kept for living voices
    const dl = ctx.createDelay(1.5); dl.delayTime.value = 0.58;
    const fb = ctx.createGain(); fb.gain.value = 0.42;
    const damp = ctx.createBiquadFilter(); damp.type = "lowpass"; damp.frequency.value = 1100;
    dl.connect(damp); damp.connect(fb); fb.connect(dl);
    const wet = ctx.createGain(); wet.gain.value = 0.45;
    dl.connect(wet); wet.connect(scene.gain);
    // an owl at dusk, rarely
    this._every(scene, 24, 55, () => self._hoot(scene, 350, 0.028, dl));
  }

  _night(scene) {
    const ctx = this.ctx;
    const self = this;
    // the dark itself
    const n = this._src(scene, this.noise("brown"));
    const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 130;
    const g = ctx.createGain();
    n.connect(f); f.connect(g); g.connect(scene.gain);
    this._walk(scene, g.gain, 0.04, 0.015, 2.5, 6, 2);
    // night breeze
    const n2 = this._src(scene, this.noise("pink"));
    const f2 = ctx.createBiquadFilter(); f2.type = "bandpass"; f2.Q.value = 0.7;
    const g2 = ctx.createGain(); g2.gain.value = 0.02;
    n2.connect(f2); f2.connect(g2); g2.connect(scene.gain);
    this._walk(scene, f2.frequency, 600, 240, 1.8, 4.5, 1.4);
    this._gusts(scene, [{ p: g2.gain, base: 0.02, peak: 0.06 }], 12, 26, 2, 4, 4, 8);
    // the cricket chorus — two trilling voices, left and right
    const trill = (fq, rate, base, pan) => {
      const s = self._src(scene, self.noise("white"));
      const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 26; bp.frequency.value = fq;
      const tg = ctx.createGain();
      s.connect(bp); bp.connect(tg); tg.connect(self._panTo(scene, pan));
      self._lfo(scene, rate, base * 0.9, base, tg.gain);
    };
    trill(4300, 31, 0.0032, 0.25);
    trill(4650, 26, 0.0024, -0.3);
    // a nearer cricket, calling in pips
    this._every(scene, 1.1, 2.6, () => {
      if (Math.random() < 0.3) return;
      const out = self._pan(scene);
      const t0 = ctx.currentTime + 0.02;
      const fq = 3900 + Math.random() * 700;
      for (let i = 0; i < 3; i++) {
        const t = t0 + i * 0.045;
        const co = ctx.createOscillator(); co.type = "sine"; co.frequency.value = fq;
        const cg = ctx.createGain(); co.connect(cg); cg.connect(out);
        cg.gain.setValueAtTime(0.0001, t);
        cg.gain.linearRampToValueAtTime(0.006, t + 0.006);
        cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
        co.start(t); co.stop(t + 0.03);
      }
    });
    // an owl far across the dark
    this._every(scene, 40, 90, () => self._hoot(scene, 300, 0.014, null));
  }
}

const AUDIO = new AudioEngine();

/* ========================================================================== */
/*  LIVING SCENES — layered generative canvas worlds, one per archetype      */
/* ========================================================================== */

function vgrad(ctx, W, H, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  for (let i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function vignette(ctx, W, H, a) {
  const g = ctx.createRadialGradient(W / 2, H * 0.42, Math.min(W, H) * 0.22, W / 2, H * 0.52, Math.max(W, H) * 0.85);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0," + a + ")");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const b = ctx.createLinearGradient(0, H * 0.55, 0, H);
  b.addColorStop(0, "rgba(0,0,0,0)");
  b.addColorStop(1, "rgba(3,5,9,0.45)");
  ctx.fillStyle = b;
  ctx.fillRect(0, 0, W, H);
}

function ridge(ctx, W, H, yBase, amp, seed, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-4, H + 4);
  ctx.lineTo(-4, yBase);
  for (let x = 0; x <= W + 14; x += 14) {
    const y = yBase +
      Math.sin(x * 0.012 + seed) * amp * 0.5 +
      Math.sin(x * 0.033 + seed * 2.7) * amp * 0.32 +
      Math.sin(x * 0.0053 + seed * 1.3) * amp * 0.7;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W + 4, H + 4);
  ctx.closePath();
  ctx.fill();
}

function makeScene(kind) {
  const R = Math.random;
  const sin = Math.sin;
  const TAU = Math.PI * 2;

  /* ------------------------------- TUNDRA -------------------------------- */
  if (kind === "tundra") {
    let snow = [];
    return {
      resize(W, H) {
        snow = [];
        const layers = [[46, 0.9, 9], [32, 1.5, 16], [18, 2.4, 26]];
        for (let li = 0; li < layers.length; li++) {
          const L = layers[li];
          for (let i = 0; i < L[0]; i++) {
            snow.push({ x: R() * W, y: R() * H, r: L[1] * (0.7 + R() * 0.6), sp: L[2] * (0.7 + R() * 0.6), ph: R() * TAU, li: li });
          }
        }
      },
      draw(ctx, W, H, t, dt) {
        vgrad(ctx, W, H, [[0, "#0a141d"], [0.55, "#123040"], [1, "#28505f"]]);
        // aurora ribbons
        for (let k = 0; k < 2; k++) {
          const yB = H * (0.2 + k * 0.11);
          const col = k ? "rgba(140,190,255," : "rgba(120,255,205,";
          const pts = [];
          for (let x = 0; x <= W; x += 10) {
            pts.push([x, yB + sin(x * 0.004 + t * 0.1 + k * 2) * 26 + sin(x * 0.011 - t * 0.06 + k) * 12]);
          }
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
          for (let i = pts.length - 1; i >= 0; i--) ctx.lineTo(pts[i][0], pts[i][1] + 46 + sin(i * 0.2 + t * 0.3) * 6);
          ctx.closePath();
          const gr = ctx.createLinearGradient(0, yB - 40, 0, yB + 86);
          gr.addColorStop(0, col + "0)");
          gr.addColorStop(0.45, col + (0.1 + 0.04 * sin(t * 0.23 + k)) + ")");
          gr.addColorStop(1, col + "0)");
          ctx.fillStyle = gr;
          ctx.fill();
        }
        ridge(ctx, W, H, H * 0.62, 34, 3.1, "#132631");
        ridge(ctx, W, H, H * 0.74, 46, 7.7, "#0d1b24");
        // rare sheen sweeping across the ice
        const sw = Math.pow(Math.max(0, sin(t * 0.05)), 10) * 0.08;
        if (sw > 0.002) {
          const g = ctx.createLinearGradient(0, 0, W, H);
          g.addColorStop(0, "rgba(220,245,255,0)");
          g.addColorStop(0.5, "rgba(220,245,255," + sw + ")");
          g.addColorStop(1, "rgba(220,245,255,0)");
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
        }
        // snowfall
        ctx.fillStyle = "#eef8fc";
        for (let i = 0; i < snow.length; i++) {
          const s = snow[i];
          s.y += s.sp * dt;
          s.x += sin(t * 0.4 + s.ph) * 0.25 + 4 * dt;
          if (s.y > H + 4) { s.y = -4; s.x = R() * W; }
          if (s.x > W + 4) s.x = -4;
          ctx.globalAlpha = 0.25 + 0.45 * (s.li / 2);
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, TAU);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        vignette(ctx, W, H, 0.42);
      },
    };
  }

  /* ------------------------------ VOLCANIC ------------------------------- */
  if (kind === "volcanic") {
    let embers = [], wisps = [];
    return {
      resize(W, H) {
        embers = []; wisps = [];
        for (let i = 0; i < 56; i++) embers.push({ x: R() * W, y: R() * H, sp: 14 + R() * 26, ph: R() * TAU, rr: 0.8 + R() * 1.4 });
        for (let i = 0; i < 5; i++) wisps.push({ x: R() * W, y: H * (0.45 + R() * 0.4), r: 60 + R() * 90, sp: 6 + R() * 8, ph: R() * TAU });
      },
      draw(ctx, W, H, t, dt) {
        vgrad(ctx, W, H, [[0, "#080405"], [0.5, "#200a0c"], [1, "#3a130f"]]);
        // breathing magma glow beneath everything
        const p = 0.16 + 0.07 * sin(t * 0.45) + 0.03 * sin(t * 1.7);
        const rg = ctx.createRadialGradient(W * 0.5, H * 1.08, 10, W * 0.5, H * 1.08, H * 0.95);
        rg.addColorStop(0, "rgba(255,96,44," + p + ")");
        rg.addColorStop(1, "rgba(255,96,44,0)");
        ctx.fillStyle = rg;
        ctx.fillRect(0, 0, W, H);
        ridge(ctx, W, H, H * 0.7, 50, 4.2, "#160607");
        ridge(ctx, W, H, H * 0.82, 60, 9.9, "#0b0304");
        // slow smoke
        for (let i = 0; i < wisps.length; i++) {
          const wp = wisps[i];
          wp.y -= wp.sp * dt;
          wp.x += sin(t * 0.2 + wp.ph) * 6 * dt;
          if (wp.y < -wp.r) { wp.y = H + wp.r; wp.x = R() * W; }
          const wg = ctx.createRadialGradient(wp.x, wp.y, 1, wp.x, wp.y, wp.r);
          wg.addColorStop(0, "rgba(96,64,68,0.06)");
          wg.addColorStop(1, "rgba(96,64,68,0)");
          ctx.fillStyle = wg;
          ctx.fillRect(wp.x - wp.r, wp.y - wp.r, wp.r * 2, wp.r * 2);
        }
        // rising embers
        for (let i = 0; i < embers.length; i++) {
          const e = embers[i];
          e.y -= e.sp * dt;
          e.x += sin(t * 0.8 + e.ph) * 10 * dt;
          if (e.y < -6) { e.y = H + 6; e.x = R() * W; }
          const fl = 0.35 + 0.5 * Math.abs(sin(t * 2.3 + e.ph * 3));
          ctx.globalAlpha = fl * ((e.y / H) * 0.55 + 0.25);
          ctx.fillStyle = fl > 0.62 ? "#ffd28a" : "#ff8a4d";
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.rr, 0, TAU);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        vignette(ctx, W, H, 0.5);
      },
    };
  }

  /* ------------------------------- SEASIDE ------------------------------- */
  if (kind === "seaside") {
    let clouds = [], birds = [], foam = [];
    return {
      resize(W, H) {
        clouds = []; birds = []; foam = [];
        for (let i = 0; i < 4; i++) clouds.push({ x: R() * W, y: H * (0.08 + R() * 0.28), w: 120 + R() * 140, sp: 4 + R() * 5 });
        for (let i = 0; i < 3; i++) birds.push({ x: R() * W, y: H * (0.14 + R() * 0.2), sp: 12 + R() * 10, ph: R() * TAU });
        for (let i = 0; i < 40; i++) foam.push({ x: R() * W, y: H * (0.6 + R() * 0.37), ph: R() * TAU, tw: 0.6 + R() * 1.6 });
      },
      draw(ctx, W, H, t, dt) {
        vgrad(ctx, W, H, [[0, "#182f3d"], [0.48, "#63929f"], [0.52, "#527f8c"], [1, "#0c2833"]]);
        // low sun
        const sg = ctx.createRadialGradient(W * 0.64, H * 0.5, 5, W * 0.64, H * 0.5, H * 0.5);
        sg.addColorStop(0, "rgba(255,224,178,0.2)");
        sg.addColorStop(1, "rgba(255,224,178,0)");
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, W, H);
        // drifting clouds
        for (let i = 0; i < clouds.length; i++) {
          const c = clouds[i];
          c.x += c.sp * dt;
          if (c.x - c.w > W) c.x = -c.w;
          ctx.fillStyle = "rgba(235,244,246,0.055)";
          for (let k = -1; k <= 1; k++) {
            ctx.beginPath();
            ctx.ellipse(c.x + k * c.w * 0.3, c.y + Math.abs(k) * 5, c.w * 0.36, 14, 0, 0, TAU);
            ctx.fill();
          }
        }
        // far birds
        ctx.strokeStyle = "rgba(16,36,44,0.55)";
        ctx.lineWidth = 1.4;
        for (let i = 0; i < birds.length; i++) {
          const b = birds[i];
          b.x += b.sp * dt;
          if (b.x > W + 12) { b.x = -12; b.y = H * (0.12 + R() * 0.22); }
          const fl = sin(t * 5 + b.ph) * 2.4;
          ctx.beginPath();
          ctx.moveTo(b.x - 5, b.y);
          ctx.quadraticCurveTo(b.x - 2, b.y - 3 - fl, b.x, b.y);
          ctx.quadraticCurveTo(b.x + 2, b.y - 3 - fl, b.x + 5, b.y);
          ctx.stroke();
        }
        // sun glints on the water
        for (let i = 0; i < 26; i++) {
          const y = H * 0.53 + i * ((H * 0.42) / 26);
          const w = 6 + i * 1.1;
          const x = W * 0.64 + sin(t * (0.8 + i * 0.07) + i * 2.4) * (8 + i * 1.6);
          const a = (0.05 + 0.09 * Math.abs(sin(t * 1.3 + i))) * (1 - i / 30);
          ctx.fillStyle = "rgba(255,230,190," + a + ")";
          ctx.fillRect(x - w / 2, y, w, 1.6);
        }
        // rolling swells
        for (let j = 0; j < 3; j++) {
          const yB = H * (0.68 + j * 0.1);
          const dir = j % 2 ? -1 : 1;
          ctx.beginPath();
          ctx.moveTo(-4, H + 4);
          ctx.lineTo(-4, yB);
          for (let x = 0; x <= W + 12; x += 12) {
            const y = yB + sin(x * 0.007 + t * (0.22 + j * 0.06) * dir + j * 2) * 7 + sin(x * 0.021 - t * 0.13) * 3;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(W + 4, H + 4);
          ctx.closePath();
          ctx.fillStyle = "rgba(190,225,232," + (0.045 + j * 0.02) + ")";
          ctx.fill();
          ctx.beginPath();
          for (let x = 0; x <= W + 12; x += 12) {
            const y = yB + sin(x * 0.007 + t * (0.22 + j * 0.06) * dir + j * 2) * 7 + sin(x * 0.021 - t * 0.13) * 3;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = "rgba(255,255,255," + (0.08 + j * 0.04) + ")";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        // foam sparkles
        for (let i = 0; i < foam.length; i++) {
          const fmk = foam[i];
          const a = 0.12 + 0.2 * Math.abs(sin(t * fmk.tw + fmk.ph));
          ctx.fillStyle = "rgba(230,246,248," + a + ")";
          ctx.fillRect(fmk.x, fmk.y, 1.6, 1.6);
        }
        vignette(ctx, W, H, 0.4);
      },
    };
  }

  /* -------------------------------- FOREST ------------------------------- */
  if (kind === "forest") {
    let motes = [], leaves = [], trunks = [];
    return {
      resize(W, H) {
        motes = []; leaves = []; trunks = [];
        for (let i = 0; i < 55; i++) motes.push({ x: R() * W, y: R() * H, sp: 5 + R() * 9, ph: R() * TAU, r: 0.8 + R() * 1.4, tw: 0.5 + R() * 1.5 });
        for (let i = 0; i < 7; i++) leaves.push({ x: R() * W, y: R() * H, sp: 16 + R() * 14, ph: R() * TAU, rot: R() * TAU });
        trunks = [
          { x: W * 0.06, w: 15 }, { x: W * 0.14, w: 8 },
          { x: W * 0.9, w: 13 }, { x: W * 0.82, w: 7 },
        ];
      },
      draw(ctx, W, H, t, dt) {
        vgrad(ctx, W, H, [[0, "#08120b"], [0.5, "#173a23"], [1, "#0c2114"]]);
        // glade light
        const gl = ctx.createRadialGradient(W * 0.5, H * 0.32, 10, W * 0.5, H * 0.32, H * 0.55);
        gl.addColorStop(0, "rgba(196,232,150,0.1)");
        gl.addColorStop(1, "rgba(196,232,150,0)");
        ctx.fillStyle = gl;
        ctx.fillRect(0, 0, W, H);
        // swaying light shafts
        for (let i = 0; i < 4; i++) {
          const bx = W * (0.18 + i * 0.22);
          const ang = -0.16 + i * 0.03 + sin(t * 0.08 + i) * 0.02;
          ctx.save();
          ctx.translate(bx, -40);
          ctx.rotate(ang);
          const bw = 40 + i * 14;
          const bg2 = ctx.createLinearGradient(0, 0, 0, H * 0.9);
          bg2.addColorStop(0, "rgba(216,240,168," + (0.09 + 0.03 * sin(t * 0.15 + i * 2)) + ")");
          bg2.addColorStop(1, "rgba(216,240,168,0)");
          ctx.fillStyle = bg2;
          ctx.fillRect(-bw / 2, 0, bw, H * 0.95);
          ctx.restore();
        }
        // dark canopy corners + trunks framing the glade
        const cnr = [[0, 0], [W, 0]];
        for (let i = 0; i < 2; i++) {
          const cg = ctx.createRadialGradient(cnr[i][0], cnr[i][1], 10, cnr[i][0], cnr[i][1], W * 0.4);
          cg.addColorStop(0, "rgba(2,8,4,0.82)");
          cg.addColorStop(1, "rgba(2,8,4,0)");
          ctx.fillStyle = cg;
          ctx.fillRect(0, 0, W, H);
        }
        ctx.fillStyle = "rgba(4,12,6,0.9)";
        for (let i = 0; i < trunks.length; i++) {
          const tr = trunks[i];
          ctx.fillRect(tr.x - tr.w / 2, 0, tr.w, H);
        }
        // falling leaves
        ctx.fillStyle = "rgba(150,190,110,0.5)";
        for (let i = 0; i < leaves.length; i++) {
          const l = leaves[i];
          l.y += l.sp * dt;
          l.x += sin(t * 0.9 + l.ph) * 14 * dt;
          l.rot += dt * (0.6 + sin(l.ph) * 0.3);
          if (l.y > H + 8) { l.y = -8; l.x = R() * W; }
          ctx.save();
          ctx.translate(l.x, l.y);
          ctx.rotate(l.rot + sin(t * 2 + l.ph) * 0.5);
          ctx.beginPath();
          ctx.ellipse(0, 0, 4.5, 2, 0, 0, TAU);
          ctx.fill();
          ctx.restore();
        }
        // drifting pollen motes
        for (let i = 0; i < motes.length; i++) {
          const m = motes[i];
          m.y -= m.sp * dt * 0.5;
          m.x += (sin(t * 0.5 + m.ph) * 6 + 3) * dt;
          if (m.y < -4) { m.y = H + 4; m.x = R() * W; }
          if (m.x > W + 4) m.x = -4;
          const a = 0.15 + 0.3 * Math.abs(sin(t * m.tw + m.ph));
          ctx.fillStyle = "rgba(238,247,200," + a + ")";
          ctx.beginPath();
          ctx.arc(m.x, m.y, m.r, 0, TAU);
          ctx.fill();
        }
        vignette(ctx, W, H, 0.45);
      },
    };
  }

  /* ------------------------------- MOUNTAIN ------------------------------ */
  if (kind === "mountain") {
    let stars = [], mist = [];
    return {
      resize(W, H) {
        stars = []; mist = [];
        for (let i = 0; i < 90; i++) stars.push({ x: R() * W, y: R() * H * 0.52, r: 0.5 + R() * 0.9, tw: 0.3 + R() * 1.4, ph: R() * TAU });
        for (let i = 0; i < 3; i++) mist.push({ y: H * (0.6 + i * 0.115), sp: 5 + i * 3, off: R() * W, r: 150 + R() * 80 });
      },
      draw(ctx, W, H, t, dt) {
        vgrad(ctx, W, H, [[0, "#161129"], [0.55, "#2e2354"], [1, "#5a3f78"]]);
        // early stars
        for (let i = 0; i < stars.length; i++) {
          const s = stars[i];
          ctx.globalAlpha = 0.2 + 0.5 * Math.abs(sin(t * s.tw + s.ph));
          ctx.fillStyle = "#f4efff";
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r, 0, TAU);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        // rising moon
        const mg = ctx.createRadialGradient(W * 0.72, H * 0.2, 4, W * 0.72, H * 0.2, 95);
        mg.addColorStop(0, "rgba(232,222,252,0.2)");
        mg.addColorStop(1, "rgba(232,222,252,0)");
        ctx.fillStyle = mg;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "#efe9fb";
        ctx.beginPath();
        ctx.arc(W * 0.72, H * 0.2, 20, 0, TAU);
        ctx.fill();
        ridge(ctx, W, H, H * 0.58, 40, 2.2, "#2a1e4e");
        // mist between ridges
        for (let i = 0; i < mist.length; i++) {
          const ms = mist[i];
          ms.off += ms.sp * dt;
          const cx = ((ms.off % (W + 500)) + W + 500) % (W + 500) - 250;
          ctx.save();
          ctx.translate(cx, ms.y);
          ctx.scale(3.4, 1);
          const gm = ctx.createRadialGradient(0, 0, 1, 0, 0, ms.r / 3);
          gm.addColorStop(0, "rgba(180,170,215,0.075)");
          gm.addColorStop(1, "rgba(180,170,215,0)");
          ctx.fillStyle = gm;
          ctx.beginPath();
          ctx.arc(0, 0, ms.r / 3, 0, TAU);
          ctx.fill();
          ctx.restore();
          if (i === 0) ridge(ctx, W, H, H * 0.7, 55, 5.9, "#1b1338");
          if (i === 1) ridge(ctx, W, H, H * 0.84, 70, 8.4, "#0e0a22");
        }
        vignette(ctx, W, H, 0.42);
      },
    };
  }

  /* ------------------------------ GREY NIGHT ------------------------------ */
  let nStars = [], nClouds = [];
  const meteor = { active: false, next: 8 + R() * 14, x: 0, y: 0, vx: 0, vy: 0, life: 0 };
  return {
    resize(W, H) {
      nStars = []; nClouds = [];
      for (let i = 0; i < 140; i++) nStars.push({ x: R() * W, y: R() * H * 0.72, r: 0.4 + R() * 1.0, tw: 0.15 + R() * 0.8, ph: R() * TAU, big: R() < 0.06 });
      for (let i = 0; i < 3; i++) nClouds.push({ x: R() * W, y: H * (0.16 + R() * 0.3), w: 180 + R() * 160, sp: 2.5 + R() * 2.5 });
    },
    draw(ctx, W, H, t, dt) {
      vgrad(ctx, W, H, [[0, "#06080e"], [0.6, "#0f141d"], [1, "#161d2a"]]);
      // stars
      for (let i = 0; i < nStars.length; i++) {
        const s = nStars[i];
        const a = 0.18 + 0.5 * Math.abs(sin(t * s.tw + s.ph));
        ctx.globalAlpha = a;
        ctx.fillStyle = "#dfe6f2";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, TAU);
        ctx.fill();
        if (s.big) {
          ctx.globalAlpha = a * 0.5;
          ctx.strokeStyle = "#dfe6f2";
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(s.x - 4, s.y); ctx.lineTo(s.x + 4, s.y);
          ctx.moveTo(s.x, s.y - 4); ctx.lineTo(s.x, s.y + 4);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      // crescent moon
      const mx = W * 0.68, my = H * 0.17, mr = 19;
      const hg = ctx.createRadialGradient(mx, my, 2, mx, my, 80);
      hg.addColorStop(0, "rgba(220,228,244,0.14)");
      hg.addColorStop(1, "rgba(220,228,244,0)");
      ctx.fillStyle = hg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#dfe5f2";
      ctx.beginPath();
      ctx.arc(mx, my, mr, -Math.PI * 0.5, Math.PI * 0.5, false);
      ctx.arc(mx + mr * 0.45, my, mr * 0.78, Math.PI * 0.5, -Math.PI * 0.5, true);
      ctx.closePath();
      ctx.fill();
      // thin drifting clouds
      for (let i = 0; i < nClouds.length; i++) {
        const c = nClouds[i];
        c.x += c.sp * dt;
        if (c.x - c.w > W) c.x = -c.w;
        ctx.fillStyle = "rgba(140,155,190,0.05)";
        ctx.beginPath();
        ctx.ellipse(c.x, c.y, c.w * 0.5, 10, 0, 0, TAU);
        ctx.fill();
      }
      // rare shooting star
      if (!meteor.active && t > meteor.next) {
        meteor.active = true;
        meteor.x = W * (0.15 + R() * 0.7);
        meteor.y = H * (0.08 + R() * 0.2);
        meteor.vx = -(160 + R() * 120);
        meteor.vy = 90 + R() * 60;
        meteor.life = 0;
      }
      if (meteor.active) {
        meteor.life += dt;
        meteor.x += meteor.vx * dt;
        meteor.y += meteor.vy * dt;
        const fade = Math.max(0, 1 - meteor.life / 0.9);
        const lg = ctx.createLinearGradient(meteor.x, meteor.y, meteor.x - meteor.vx * 0.14, meteor.y - meteor.vy * 0.14);
        lg.addColorStop(0, "rgba(235,240,250," + 0.8 * fade + ")");
        lg.addColorStop(1, "rgba(235,240,250,0)");
        ctx.strokeStyle = lg;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(meteor.x - meteor.vx * 0.14, meteor.y - meteor.vy * 0.14);
        ctx.stroke();
        if (meteor.life > 0.9) { meteor.active = false; meteor.next = t + 16 + R() * 26; }
      }
      ridge(ctx, W, H, H * 0.88, 22, 3.3, "#04060b");
      vignette(ctx, W, H, 0.38);
    },
  };
}

/* full-bleed animated canvas; respects prefers-reduced-motion */
function SceneCanvas({ kind }) {
  const ref = useRef(null);
  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const scene = makeScene(kind);
    const reduced = typeof window !== "undefined" && window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, raf = 0, last = 0;
    const frame = (t, dt) => { try { scene.draw(ctx, W, H, t, dt); } catch (e) {} };
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth || window.innerWidth;
      H = cv.clientHeight || window.innerHeight;
      cv.width = Math.max(1, Math.floor(W * dpr));
      cv.height = Math.max(1, Math.floor(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (scene.resize) scene.resize(W, H);
      if (reduced) frame(1.7, 0.016);
    };
    resize();
    let ro = null;
    if (typeof ResizeObserver !== "undefined") { ro = new ResizeObserver(resize); ro.observe(cv); }
    else window.addEventListener("resize", resize);
    if (!reduced) {
      const loop = (ms) => {
        const t = ms / 1000;
        const dt = last ? Math.min(t - last, 0.05) : 0.016;
        last = t;
        frame(t, dt);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect(); else window.removeEventListener("resize", resize);
    };
  }, [kind]);
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />;
}

/* ========================================================================== */
/*  ICONS, GLOBAL STYLE, SHARED PIECES                                        */
/* ========================================================================== */

function Ic({ name, size = 20, style }) {
  const P = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
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

const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Outfit:wght@200;300;400;500&display=swap');
* { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
html, body, #root { height: 100%; }
body { margin: 0; background: #05070b; }
button { font-family: inherit; }
:focus-visible { outline: 2px solid rgba(255,255,255,0.55); outline-offset: 2px; }
.bsRoot {
  position: fixed; inset: 0; overflow: hidden;
  background: #05070b; color: #f2f4f7;
  font-family: 'Outfit', system-ui, sans-serif; font-weight: 300;
}
.serif { font-family: 'Cormorant Garamond', Georgia, serif; }
.bsScroll {
  height: 100%; overflow-y: auto; overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.16) transparent;
}
.bsScroll::-webkit-scrollbar { width: 4px; }
.bsScroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.16); border-radius: 4px; }
.bsScroll::-webkit-scrollbar-track { background: transparent; }
.bsIcon {
  width: 40px; height: 40px; border-radius: 14px; flex: none;
  display: inline-flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.13);
  color: rgba(255,255,255,0.88); cursor: pointer;
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  transition: background .25s, transform .15s;
}
.bsIcon:hover { background: rgba(255,255,255,0.13); }
.bsIcon:active { transform: scale(0.94); }
.bsBtn {
  padding: 12px 26px; border-radius: 999px; cursor: pointer;
  border: 1px solid rgba(255,255,255,0.2); color: #f2f4f7;
  background: rgba(255,255,255,0.07);
  font: 400 14px 'Outfit', sans-serif; letter-spacing: 0.08em;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  transition: background .25s, transform .15s, opacity .25s;
}
.bsBtn:hover { background: rgba(255,255,255,0.13); }
.bsBtn:active { transform: scale(0.97); }
.bsBtn.primary { background: rgba(240,244,248,0.92); color: #0b1016; border-color: transparent; font-weight: 500; }
.bsBtn.primary:hover { background: #ffffff; }
.bsBtn:disabled { opacity: 0.35; cursor: default; }
.bsPill {
  padding: 10px 20px; border-radius: 999px; cursor: pointer;
  border: 1px solid rgba(255,255,255,0.2);
  background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.85);
  font: 400 14px 'Outfit', sans-serif; letter-spacing: 0.04em;
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  transition: all .25s;
}
.bsInput, .bsSelect {
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.14);
  border-radius: 12px; color: #eef1f5; padding: 10px 12px;
  font: 400 16px 'Outfit', sans-serif; outline: none; min-width: 0;
  transition: border-color .25s;
}
.bsInput:focus, .bsSelect:focus { border-color: rgba(255,255,255,0.4); }
.bsInput::placeholder { color: rgba(255,255,255,0.35); }
.bsSelect option { background: #12161f; color: #eef1f5; }
input[type="time"].bsInput, input[type="number"].bsInput { color-scheme: dark; }
textarea.bsInput { resize: vertical; min-height: 88px; line-height: 1.55; width: 100%; }
.bsRange {
  -webkit-appearance: none; appearance: none; height: 3px; border-radius: 2px;
  background: rgba(255,255,255,0.22); outline: none; width: 100%;
}
.bsRange::-webkit-slider-thumb {
  -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%;
  background: #e8eef5; border: none; cursor: pointer;
}
.bsRange::-moz-range-thumb {
  width: 16px; height: 16px; border-radius: 50%;
  background: #e8eef5; border: none; cursor: pointer;
}
@keyframes bsFade { from { opacity: 0; } to { opacity: 1; } }
@keyframes bsRise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes bsEnter { from { opacity: 0; transform: scale(1.045); } to { opacity: 1; transform: scale(1); } }
@keyframes bsFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
@keyframes bsBreathe { 0%, 100% { opacity: 0.5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
@keyframes bsDrift { 0% { transform: translate(0,0); } 50% { transform: translate(-18px,-10px); } 100% { transform: translate(0,0); } }
@keyframes bsTileFloat { 0%, 100% { transform: translateY(0); opacity: 0.45; } 50% { transform: translateY(-9px); opacity: 0.9; } }
@keyframes bsVeilIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes bsVeilOut { from { opacity: 1; } to { opacity: 0; } }
.fadeIn { animation: bsFade .8s ease both; }
.fadeSlow { animation: bsFade 1.8s ease both; }
.riseIn { animation: bsRise .7s cubic-bezier(.2,.7,.2,1) both; }
.enterScene { animation: bsEnter 1s cubic-bezier(.2,.6,.2,1) both; }
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
}
`;

const glassCard = {
  background: "rgba(10,15,22,0.5)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 18,
  padding: 16,
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
};

function Pill({ on, accent, onClick, children }) {
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

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", margin: "32px 0 12px" }}>
      {children}
    </div>
  );
}

/* shared scaffold for the quiet inner pages (journal / stillness / settings) */
function Shell({ kind, title, sub, onBack, children }) {
  return (
    <div className="bsRoot">
      <div style={{ position: "absolute", inset: 0 }}>
        <SceneCanvas kind={kind} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "rgba(4,7,11,0.78)" }} />
      <div className="bsScroll" style={{ position: "relative" }}>
        <div className="fadeIn" style={{ maxWidth: 560, margin: "0 auto", padding: "22px 20px 72px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button className="bsIcon" onClick={onBack} title="Back" aria-label="Back">
              <Ic name="back" size={18} />
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="serif" style={{ fontSize: 30, fontWeight: 500, fontStyle: "italic" }}>{title}</div>
              {sub && (
                <div style={{ fontSize: 11.5, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
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

function ToastBar({ msg }) {
  return (
    <div style={{ position: "fixed", left: "50%", bottom: 26, transform: "translateX(-50%)", zIndex: 60, pointerEvents: "none" }}>
      <div
        className="riseIn"
        style={{
          padding: "10px 20px", borderRadius: 999, fontSize: 13, letterSpacing: "0.05em",
          color: "#eef2f7", background: "rgba(12,17,24,0.74)",
          border: "1px solid rgba(255,255,255,0.14)",
          backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
          whiteSpace: "nowrap",
        }}
      >
        {msg}
      </div>
    </div>
  );
}

function Splash() {
  return (
    <div className="bsRoot" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="fadeIn" style={{ textAlign: "center" }}>
        <div style={{ letterSpacing: "0.5em", fontWeight: 200, fontSize: 20, marginLeft: "0.5em" }}>BIOSPHERE</div>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#9fd8e8", margin: "18px auto 0", animation: "bsBreathe 2.2s ease-in-out infinite" }} />
      </div>
    </div>
  );
}

/* a quiet countdown offering passage into the biosphere that just began */
function Handoff({ label, accent, until, total, onCross, onRemain }) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick((x) => x + 1), 150);
    return () => clearInterval(iv);
  }, []);
  const left = Math.max(0, until - Date.now());
  return (
    <div style={{ position: "fixed", left: 0, right: 0, bottom: 24, display: "flex", justifyContent: "center", zIndex: 55, pointerEvents: "none" }}>
      <div className="riseIn" style={{ pointerEvents: "auto", display: "flex", alignItems: "center", gap: 14, padding: "12px 16px 12px 20px", borderRadius: 999, background: "rgba(9,13,20,0.72)", border: "1px solid rgba(255,255,255,0.16)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", maxWidth: "calc(100vw - 32px)" }}>
        <button
          onClick={onCross}
          aria-label={"Cross into " + label + " now"}
          style={{ background: "none", border: "none", color: "#f2f4f7", cursor: "pointer", textAlign: "left", padding: 0, minWidth: 0 }}
        >
          <div style={{ fontSize: 11, letterSpacing: "0.26em", textTransform: "uppercase", color: accent, whiteSpace: "nowrap" }}>{label} begins</div>
          <div style={{ height: 2, marginTop: 7, width: 148, background: "rgba(255,255,255,0.16)", borderRadius: 2 }}>
            <div style={{ height: "100%", width: (100 * left / total) + "%", background: accent, borderRadius: 2, transition: "width .15s linear" }} />
          </div>
        </button>
        <button className="bsPill" style={{ padding: "8px 14px", fontSize: 12.5, flex: "none" }} onClick={onRemain}>Remain here</button>
      </div>
    </div>
  );
}

/* ========================================================================== */
/*  HOME — the day's biospheres, in order, behind glass                       */
/* ========================================================================== */

function BioTile({ bio, state, hb, onOpen }) {
  const A = ARCH[bio.archetype] || ARCH.night;
  return (
    <div
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onOpen(); }}
      style={{
        position: "relative", borderRadius: 22, overflow: "hidden", cursor: "pointer",
        marginBottom: 14,
        border: state === "now" ? "1px solid " + A.accent + "66" : "1px solid rgba(255,255,255,0.09)",
        boxShadow: state === "now" ? "0 10px 46px -10px " + A.glow : "0 4px 22px -12px rgba(0,0,0,0.65)",
        opacity: state === "past" ? 0.62 : 1,
        transition: "opacity .5s, box-shadow .5s, border-color .5s",
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: A.css, filter: state === "past" ? "saturate(0.55) brightness(0.82)" : "none" }} />
      <div style={{ position: "absolute", inset: -40, background: "radial-gradient(circle at 78% 28%, " + A.glow + ", transparent 62%)", opacity: 0.5, animation: "bsDrift 11s ease-in-out infinite" }} />
      {[0, 1, 2].map((i) => (
        <div key={i} style={{
          position: "absolute", left: (22 + i * 26) + "%", top: (28 + i * 16) + "%",
          width: 3, height: 3, borderRadius: "50%", background: A.soft, opacity: 0.5,
          animation: "bsTileFloat " + (6 + i * 2.3) + "s ease-in-out " + (i * 1.4) + "s infinite",
        }} />
      ))}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(4,7,10,0.55), rgba(4,7,10,0.15) 60%, rgba(4,7,10,0.35))" }} />
      <div style={{ position: "relative", padding: "17px 18px 15px", display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, letterSpacing: "0.18em", color: "rgba(255,255,255,0.75)" }}>
            <span>{fmtTime(bio.start)}</span>
            {state === "now" && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: A.accent }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: A.accent, animation: "bsBreathe 2.6s ease-in-out infinite" }} />
                NOW
              </span>
            )}
            {state === "past" && <span style={{ opacity: 0.6, letterSpacing: "0.14em" }}>passed</span>}
          </div>
          <div className="serif" style={{ fontSize: 27, fontWeight: 500, letterSpacing: "0.04em", marginTop: 2 }}>{bio.name}</div>
          <div className="serif" style={{ fontStyle: "italic", fontSize: 14.5, color: "rgba(255,255,255,0.72)" }}>
            {bio.purpose || A.tagline}
          </div>
          <div style={{ marginTop: 8, fontSize: 12.5, color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {hb.length ? hb.map((h) => h.name).join("  ·  ") : "an open window — no habits yet"}
          </div>
        </div>
        <div style={{ color: A.accent, opacity: 0.92, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: "none" }}>
          <Ic name={iconOf(bio.archetype)} size={26} />
          <Ic name="chev" size={15} style={{ opacity: 0.6 }} />
        </div>
      </div>
    </div>
  );
}

function HomeView({ sorted, habits, journal, now, sched, nightStart, soundOn, onToggleSound, onOpen, currentArch }) {
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
  const stateOf = (b) => {
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
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,7,11,0.68), rgba(4,7,11,0.44) 34%, rgba(4,7,11,0.72))" }} />
      <div className="bsScroll" style={{ position: "relative" }}>
        <div className="fadeIn" style={{ maxWidth: 560, margin: "0 auto", padding: "26px 20px 64px" }}>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 300, letterSpacing: "0.42em", fontSize: 15 }}>BIOSPHERE</div>
              <div className="serif" style={{ fontStyle: "italic", fontSize: 15, color: "rgba(255,255,255,0.65)", marginTop: 5 }}>
                {fmtDate(now)}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flex: "none" }}>
              <button className="bsIcon" title="Ambient sound" aria-label="Toggle sound" onClick={onToggleSound}>
                <Ic name={soundOn ? "sound" : "mute"} size={18} />
              </button>
              <button className="bsIcon" title="Stillness — streaks" aria-label="Streaks" onClick={() => onOpen({ name: "stats" })}>
                <Ic name="sprout" size={18} />
              </button>
              <button className="bsIcon" title="Journal" aria-label="Journal" onClick={() => onOpen({ name: "journal" })}>
                <Ic name="book" size={18} />
              </button>
              <button className="bsIcon" title="Settings" aria-label="Settings" onClick={() => onOpen({ name: "settings" })}>
                <Ic name="gear" size={18} />
              </button>
            </div>
          </div>

          <div style={{ margin: "30px 0 26px" }}>
            {preDawn ? (
              <div>
                <div className="serif" style={{ fontSize: 33, fontStyle: "italic", fontWeight: 500 }}>Before the day</div>
                <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: ARCH[sorted[0].archetype].accent, marginTop: 7 }}>
                  {sorted[0].name} opens at {fmtTime(sorted[0].start)}
                </div>
              </div>
            ) : (
              <div>
                <div className="serif" style={{ fontSize: 33, fontStyle: "italic", fontWeight: 500 }}>
                  {cur ? cur.name : "Grey Night"}
                </div>
                <div style={{ fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: A.accent, marginTop: 7 }}>
                  now · {cur ? (cur.purpose || ARCH[cur.archetype].tagline) : "reflection & rest"}
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
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onOpen({ name: "night" }); }}
            style={{
              position: "relative", borderRadius: 22, overflow: "hidden", cursor: "pointer",
              border: nightState === "now" ? "1px solid " + AN.accent + "66" : "1px solid rgba(255,255,255,0.09)",
              boxShadow: nightState === "now" ? "0 10px 46px -10px " + AN.glow : "0 4px 22px -12px rgba(0,0,0,0.65)",
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: AN.css }} />
            <div style={{ position: "absolute", inset: -40, background: "radial-gradient(circle at 74% 26%, " + AN.glow + ", transparent 60%)", opacity: 0.5 }} />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} style={{
                position: "absolute", left: (14 + i * 22) + "%", top: (24 + (i % 2) * 30) + "%",
                width: 2, height: 2, borderRadius: "50%", background: "#dfe6f2", opacity: 0.55,
                animation: "bsTileFloat " + (7 + i * 1.7) + "s ease-in-out " + i + "s infinite",
              }} />
            ))}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(3,5,9,0.5), rgba(3,5,9,0.1) 60%, rgba(3,5,9,0.3))" }} />
            <div style={{ position: "relative", padding: "17px 18px 15px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, letterSpacing: "0.18em", color: "rgba(255,255,255,0.75)" }}>
                  <span>{fmtTime(nightStart)}</span>
                  {nightState === "now" && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, color: AN.accent }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: AN.accent, animation: "bsBreathe 2.6s ease-in-out infinite" }} />
                      NOW
                    </span>
                  )}
                </div>
                <div className="serif" style={{ fontSize: 27, fontWeight: 500, letterSpacing: "0.04em", marginTop: 2 }}>Grey Night</div>
                <div className="serif" style={{ fontStyle: "italic", fontSize: 14.5, color: "rgba(255,255,255,0.72)" }}>
                  {sealed
                    ? "reflected — " + doneCount + " of " + totalCount + " fulfilled"
                    : nightState === "now"
                      ? "the day settles — enter to reflect"
                      : "nightly reflection, one habit at a time"}
                </div>
              </div>
              <div style={{ color: AN.accent, opacity: 0.92, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: "none" }}>
                <Ic name="moon" size={24} />
                <Ic name="chev" size={15} style={{ opacity: 0.6 }} />
              </div>
            </div>
          </div>

          <div className="serif" style={{ textAlign: "center", fontStyle: "italic", fontSize: 13.5, color: "rgba(255,255,255,0.4)", marginTop: 34 }}>
            Step through the day, one biosphere at a time.
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/*  IMMERSION — inside a biosphere. The interface dissolves; the world stays. */
/* ========================================================================== */

function ImmersionView({ bio, end, isNow, habits, soundOn, onToggleSound, onExit }) {
  const A = ARCH[bio.archetype] || ARCH.night;
  const [ui, setUi] = useState(true);
  const hideT = useRef(null);
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
  const [runs, setRuns] = useState({});
  const [doneT, setDoneT] = useState({});
  const [, setTick] = useState(0);
  const running = Object.keys(runs).length > 0;
  useEffect(() => {
    if (!running) return;
    const iv = setInterval(() => setTick((x) => x + 1), 500);
    return () => clearInterval(iv);
  }, [running]);
  useEffect(() => {
    const t = Date.now();
    const finished = Object.keys(runs).filter((id) => t >= runs[id].end);
    if (finished.length) {
      AUDIO.chime();
      setRuns((r) => {
        const nr = { ...r };
        finished.forEach((id) => delete nr[id]);
        return nr;
      });
      setDoneT((d) => {
        const nd = { ...d };
        finished.forEach((id) => { nd[id] = true; });
        return nd;
      });
    }
  });

  const toggleTimer = (h) => {
    if (!h.timer) return;
    setRuns((r) => {
      const nr = { ...r };
      if (nr[h.id]) delete nr[h.id];
      else nr[h.id] = { end: Date.now() + h.timer * 60000, total: h.timer * 60000 };
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
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at 50% 42%, transparent 45%, rgba(3,5,9,0.35))" }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", opacity: ui ? 1 : 0.05, transition: "opacity 1.6s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: 18, gap: 10 }}>
          <button className="bsIcon" onClick={(e) => { e.stopPropagation(); onExit(); }} title="Leave" aria-label="Leave biosphere">
            <Ic name="back" size={18} />
          </button>
          <div style={{ textAlign: "center", marginTop: 2, minWidth: 0 }}>
            <div style={{ fontSize: 11, letterSpacing: "0.32em", color: A.accent, textTransform: "uppercase" }}>
              {isNow ? "now" : "biosphere"}
            </div>
            <div className="serif" style={{ fontSize: 38, fontWeight: 500, letterSpacing: "0.05em", textShadow: "0 2px 26px rgba(0,0,0,0.55)" }}>
              {bio.name}
            </div>
            <div className="serif" style={{ fontStyle: "italic", fontSize: 15, color: "rgba(255,255,255,0.78)" }}>
              {(bio.purpose || A.tagline) + "  ·  " + fmtTime(bio.start) + " – " + fmtTime(end)}
            </div>
          </div>
          <button className="bsIcon" onClick={(e) => { e.stopPropagation(); onToggleSound(); }} title="Ambient sound" aria-label="Toggle sound">
            <Ic name={soundOn ? "sound" : "mute"} size={18} />
          </button>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 27, padding: "0 30px 40px", overflowY: "auto" }}>
          {habits.length === 0 && (
            <div className="serif" style={{ fontStyle: "italic", fontSize: 17, color: "rgba(255,255,255,0.7)", textAlign: "center" }}>
              This biosphere is open.<br />Give it a habit in settings, or simply be here.
            </div>
          )}
          {habits.map((h, i) => {
            const run = runs[h.id];
            const left = run ? Math.max(0, run.end - Date.now()) : 0;
            return (
              <div
                key={h.id}
                onClick={(e) => { e.stopPropagation(); toggleTimer(h); }}
                style={{ textAlign: "center", cursor: h.timer ? "pointer" : "default", animation: "bsFloat " + (7 + i * 1.7) + "s ease-in-out " + (i * 1.2) + "s infinite", maxWidth: 440 }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={{ color: A.accent, opacity: 0.9, display: "inline-flex" }}>
                    <Ic name={iconOf(bio.archetype)} size={13} />
                  </span>
                  <span style={{ fontSize: 18, fontWeight: 300, letterSpacing: "0.02em", color: "rgba(255,255,255,0.94)", textShadow: "0 1px 18px rgba(0,0,0,0.55)" }}>
                    {h.name}
                  </span>
                </div>
                {h.timer && !run && !doneT[h.id] && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 11, letterSpacing: "0.18em", marginTop: 6, color: "rgba(255,255,255,0.55)" }}>
                    <Ic name="clock" size={11} /> {h.timer} MIN — TAP TO BEGIN
                  </div>
                )}
                {run && (
                  <div style={{ marginTop: 7 }}>
                    <div style={{ fontSize: 15, fontVariantNumeric: "tabular-nums", color: A.soft, letterSpacing: "0.12em" }}>{msFmt(left)}</div>
                    <div style={{ height: 2, width: 150, margin: "6px auto 0", background: "rgba(255,255,255,0.15)", borderRadius: 2 }}>
                      <div style={{ height: "100%", width: (100 * (1 - left / run.total)) + "%", background: A.accent, borderRadius: 2, transition: "width .5s linear" }} />
                    </div>
                  </div>
                )}
                {doneT[h.id] && (
                  <div style={{ fontSize: 11.5, letterSpacing: "0.24em", marginTop: 6, color: A.accent }}>COMPLETE ✦</div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ textAlign: "center", paddingBottom: 22, fontSize: 11, letterSpacing: "0.26em", color: "rgba(255,255,255,0.45)" }}>
          {isNow ? "UNTIL " + fmtTime(end).toUpperCase() : "A QUIET WINDOW"}
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/*  GREY NIGHT — the day's only accounting: one habit, one reflection         */
/* ========================================================================== */

function NightView({ bios, habits, journal, now, soundOn, onToggleSound, onSeal, onExit }) {
  const AN = ARCH.night;
  const key = dayKey(now);
  const existing = journal[key];

  const order = useMemo(() => {
    const m = {};
    [...bios].sort((a, b) => t2m(a.start) - t2m(b.start)).forEach((b, i) => { m[b.id] = i; });
    return m;
  }, [bios]);
  const ordered = useMemo(
    () => [...habits].sort((a, b) => ((order[a.biosphereId] ?? 99) - (order[b.biosphereId] ?? 99))),
    [habits, order]
  );
  const bioOf = (id) => bios.find((b) => b.id === id);
  const bioName = (id) => (bioOf(id) ? bioOf(id).name : "");
  const bioAccent = (id) => ARCH[bioOf(id) ? bioOf(id).archetype : "night"].accent;

  const [mode, setMode] = useState(existing ? "sealed" : "flow");
  const [step, setStep] = useState(-1);
  const [ans, setAns] = useState(() => (existing ? JSON.parse(JSON.stringify(existing.entries || {})) : {}));

  const cur = step >= 0 && step < ordered.length ? ordered[step] : null;
  const a = cur ? ans[cur.id] : null;
  const setA = (patch) => {
    if (!cur) return;
    setAns((p) => ({
      ...p,
      [cur.id]: { name: cur.name, biosphere: bioName(cur.biosphereId), note: "", ...(p[cur.id] || {}), ...patch },
    }));
  };

  const finalize = () => {
    const out = {};
    ordered.forEach((h) => {
      const e = ans[h.id] || {};
      out[h.id] = {
        name: h.name,
        biosphere: bioName(h.biosphereId),
        done: !!e.done,
        note: (e.note || "").trim(),
      };
    });
    onSeal(out);
    setMode("sealed");
  };

  const doneNow = ordered.filter((h) => ans[h.id] && ans[h.id].done).length;
  const sealedEntries = existing ? Object.values(existing.entries || {}) : [];

  return (
    <div className="bsRoot enterScene">
      <SceneCanvas kind="night" />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at 50% 40%, transparent 40%, rgba(2,4,8,0.45))" }} />

      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 18 }}>
          <button className="bsIcon" onClick={onExit} title="Leave" aria-label="Leave Grey Night">
            <Ic name="back" size={18} />
          </button>
          <div style={{ fontSize: 11, letterSpacing: "0.34em", color: AN.accent, textTransform: "uppercase" }}>Grey Night</div>
          <button className="bsIcon" onClick={onToggleSound} title="Ambient sound" aria-label="Toggle sound">
            <Ic name={soundOn ? "sound" : "mute"} size={18} />
          </button>
        </div>

        <div className="bsScroll" style={{ flex: 1 }}>
          <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 24px 60px", minHeight: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>

            {mode === "sealed" && (
              <div className="riseIn">
                <div style={{ textAlign: "center", marginBottom: 26 }}>
                  <div style={{ color: AN.accent, marginBottom: 10 }}><Ic name="moon" size={30} /></div>
                  <div className="serif" style={{ fontSize: 34, fontStyle: "italic", fontWeight: 500 }}>Reflected</div>
                  <div className="serif" style={{ fontStyle: "italic", fontSize: 15, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>{fmtDayKey(key)}</div>
                </div>
                <div style={{ ...glassCard, display: "flex", flexDirection: "column", gap: 14 }}>
                  {sealedEntries.map((e, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", flex: "none", background: e.done ? "#cfe0f0" : "transparent", border: "1px solid rgba(215,228,242,0.8)" }} />
                        <span style={{ fontSize: 15 }}>{e.name}</span>
                        <span style={{ fontSize: 10.5, letterSpacing: "0.16em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>{e.biosphere}</span>
                      </div>
                      {e.note ? (
                        <div className="serif" style={{ fontStyle: "italic", fontSize: 15, color: "rgba(255,255,255,0.75)", margin: "6px 0 0 18px", paddingLeft: 12, borderLeft: "1px solid rgba(255,255,255,0.18)", lineHeight: 1.55 }}>
                          {e.note}
                        </div>
                      ) : null}
                    </div>
                  ))}
                  {sealedEntries.length === 0 && (
                    <div className="serif" style={{ fontStyle: "italic", color: "rgba(255,255,255,0.6)" }}>A quiet day — nothing recorded.</div>
                  )}
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>
                  <button className="bsBtn" onClick={() => { setMode("flow"); setStep(0); }}>Amend reflections</button>
                  <button className="bsBtn primary" onClick={onExit}>Rest well</button>
                </div>
              </div>
            )}

            {mode === "flow" && step === -1 && (
              <div className="riseIn" style={{ textAlign: "center" }}>
                <div style={{ color: AN.accent, marginBottom: 12 }}><Ic name="moon" size={34} /></div>
                <div className="serif" style={{ fontSize: 40, fontStyle: "italic", fontWeight: 500 }}>Grey Night</div>
                <div className="serif" style={{ fontStyle: "italic", fontSize: 15.5, color: "rgba(255,255,255,0.65)", marginTop: 5 }}>{fmtDayKey(key)}</div>
                {ordered.length ? (
                  <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.78)", margin: "22px 0 28px" }}>
                    The day settles.<br />
                    {ordered.length} {ordered.length === 1 ? "reflection awaits" : "reflections await"} — one habit at a time.
                  </p>
                ) : (
                  <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.78)", margin: "22px 0 28px" }}>
                    No habits to reflect on yet.<br />Plant some in settings, and return tomorrow night.
                  </p>
                )}
                {ordered.length ? (
                  <button className="bsBtn primary" onClick={() => setStep(0)}>Begin</button>
                ) : (
                  <button className="bsBtn" onClick={onExit}>Return</button>
                )}
              </div>
            )}

            {mode === "flow" && cur && (
              <div className="riseIn" key={step}>
                <div style={{ display: "flex", justifyContent: "center", gap: 7, marginBottom: 26 }}>
                  {ordered.map((h, i) => (
                    <span key={h.id} style={{
                      width: i === step ? 18 : 6, height: 6, borderRadius: 3,
                      background: i < step ? "rgba(215,228,242,0.85)" : i === step ? AN.accent : "rgba(255,255,255,0.22)",
                      transition: "all .4s",
                    }} />
                  ))}
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 11, letterSpacing: "0.3em", textTransform: "uppercase", color: bioAccent(cur.biosphereId) }}>
                    {bioName(cur.biosphereId)}
                  </div>
                  <div className="serif" style={{ fontSize: 31, fontWeight: 500, margin: "6px 0 4px" }}>{cur.name}</div>
                  <div style={{ fontSize: 15, color: "rgba(255,255,255,0.8)", margin: "12px 0 18px" }}>
                    Did you complete this today?
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 20 }}>
                    <Pill on={a && a.done === true} accent="#d7e4f2" onClick={() => setA({ done: true })}>● Yes</Pill>
                    <Pill on={a && a.done === false} accent="#8f9cb5" onClick={() => setA({ done: false })}>○ Not today</Pill>
                  </div>
                  <textarea
                    className="bsInput"
                    rows={3}
                    placeholder="A few words of reflection, if you like…"
                    value={(a && a.note) || ""}
                    onChange={(e) => setA({ note: e.target.value })}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
                    <button className="bsBtn" onClick={() => setStep((s) => s - 1)}>Back</button>
                    <button
                      className="bsBtn primary"
                      disabled={!a || a.done === undefined}
                      onClick={() => setStep((s) => s + 1)}
                    >
                      Continue
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mode === "flow" && step >= ordered.length && ordered.length > 0 && (
              <div className="riseIn" style={{ textAlign: "center" }}>
                <div className="serif" style={{ fontSize: 36, fontStyle: "italic", fontWeight: 500 }}>The day is complete.</div>
                <div style={{ fontSize: 15, color: "rgba(255,255,255,0.78)", margin: "14px 0 6px" }}>
                  {doneNow} of {ordered.length} {ordered.length === 1 ? "habit" : "habits"} fulfilled.
                </div>
                <div className="serif" style={{ fontStyle: "italic", fontSize: 17, color: AN.accent, marginBottom: 30 }}>Rest well.</div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="bsBtn" onClick={() => setStep(ordered.length - 1)}>Back</button>
                  <button className="bsBtn primary" onClick={finalize}>Seal the day ✦</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/*  JOURNAL — the nights, kept                                                */
/* ========================================================================== */

function JournalView({ journal, onBack }) {
  const keys = Object.keys(journal).sort().reverse();
  const [open, setOpen] = useState(keys.length ? keys[0] : null);

  return (
    <Shell kind="night" title="Journal" sub="reflections, night by night" onBack={onBack}>
      {keys.length === 0 && (
        <div style={{ textAlign: "center", marginTop: 70, color: "rgba(255,255,255,0.6)" }}>
          <Ic name="moon" size={30} style={{ opacity: 0.7 }} />
          <div className="serif" style={{ fontStyle: "italic", fontSize: 17, marginTop: 14, lineHeight: 1.6 }}>
            Nothing here yet.<br />Reflections gather after each Grey Night.
          </div>
        </div>
      )}
      <div style={{ marginTop: 22 }}>
        {keys.map((k) => {
          const d = journal[k];
          const es = Object.values(d.entries || {});
          const done = es.filter((e) => e.done).length;
          const isOpen = open === k;
          return (
            <div key={k} style={{ ...glassCard, marginBottom: 12 }}>
              <div
                onClick={() => setOpen(isOpen ? null : k)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOpen(isOpen ? null : k); }}
                style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="serif" style={{ fontSize: 20, fontWeight: 500 }}>{fmtDayKey(k)}</div>
                  <div style={{ fontSize: 12, letterSpacing: "0.16em", color: "rgba(255,255,255,0.55)", marginTop: 2 }}>
                    {done} OF {es.length} FULFILLED
                  </div>
                </div>
                <Ic name="chev" size={16} style={{ transform: isOpen ? "rotate(90deg)" : "none", transition: "transform .3s", opacity: 0.7 }} />
              </div>
              {isOpen && (
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 13 }}>
                  {es.map((e, i) => (
                    <div key={i}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", flex: "none", background: e.done ? "#cfe0f0" : "transparent", border: "1px solid rgba(215,228,242,0.8)" }} />
                        <span style={{ fontSize: 15 }}>{e.name}</span>
                        <span style={{ fontSize: 10.5, letterSpacing: "0.16em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>{e.biosphere}</span>
                      </div>
                      {e.note ? (
                        <div className="serif" style={{ fontStyle: "italic", fontSize: 15, color: "rgba(255,255,255,0.75)", margin: "6px 0 0 18px", paddingLeft: 12, borderLeft: "1px solid rgba(255,255,255,0.18)", lineHeight: 1.55 }}>
                          {e.note}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Shell>
  );
}

/* ========================================================================== */
/*  STILLNESS — streaks & rhythm, without noise                               */
/* ========================================================================== */

function StatsView({ habits, bios, journal, now, currentArch, onBack }) {
  const todayK = dayKey(now);
  const days28 = lastNDays(28, todayK);
  const daysReflected = Object.keys(journal).length;
  let totalDone = 0;
  Object.values(journal).forEach((d) => Object.values(d.entries || {}).forEach((e) => { if (e.done) totalDone++; }));

  return (
    <Shell kind={currentArch} title="Stillness" sub="streaks & rhythm" onBack={onBack}>
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <div style={{ ...glassCard, flex: 1, textAlign: "center" }}>
          <div className="serif" style={{ fontSize: 34, fontWeight: 500 }}>{daysReflected}</div>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>nights reflected</div>
        </div>
        <div style={{ ...glassCard, flex: 1, textAlign: "center" }}>
          <div className="serif" style={{ fontSize: 34, fontWeight: 500 }}>{totalDone}</div>
          <div style={{ fontSize: 11, letterSpacing: "0.2em", color: "rgba(255,255,255,0.55)", textTransform: "uppercase" }}>habits fulfilled</div>
        </div>
      </div>

      <SectionLabel>habits · last 28 days</SectionLabel>
      {habits.length === 0 && (
        <div className="serif" style={{ fontStyle: "italic", color: "rgba(255,255,255,0.6)", fontSize: 16 }}>
          No habits yet — plant some in settings.
        </div>
      )}
      {habits.map((h) => {
        const b = bios.find((x) => x.id === h.biosphereId);
        const A = ARCH[b ? b.archetype : "night"];
        const series = habitSeries(journal, h.id);
        const streak = calcStreak(series, todayK);
        const best = Math.max(calcBest(series), streak);
        return (
          <div key={h.id} style={{ ...glassCard, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 16 }}>{h.name}</span>
              <span style={{ fontSize: 10.5, letterSpacing: "0.16em", color: A.accent, textTransform: "uppercase" }}>{b ? b.name : ""}</span>
            </div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "10px 0 12px" }}>
              <span className="serif" style={{ fontSize: 38, fontWeight: 500, color: A.soft }}>{streak}</span>
              <span style={{ fontSize: 12, letterSpacing: "0.14em", color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>
                day streak · best {best}
              </span>
            </div>
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {days28.map((k) => {
                const v = series[k];
                return (
                  <span key={k} title={fmtDayKey(k)} style={{
                    width: 9, height: 9, borderRadius: "50%",
                    background: v === true ? A.accent : "transparent",
                    border: v === true ? "1px solid transparent" : v === false ? "1px solid rgba(255,255,255,0.45)" : "1px solid rgba(255,255,255,0.14)",
                  }} />
                );
              })}
            </div>
          </div>
        );
      })}
      <div className="serif" style={{ fontStyle: "italic", fontSize: 13.5, color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: 26 }}>
        Growth is quiet. So is this page.
      </div>
    </Shell>
  );
}

/* ========================================================================== */
/*  SETTINGS — the only backstage in the whole world                          */
/* ========================================================================== */

function SettingsView({ bios, setBios, habits, setHabits, nightStart, setNightStart, soundOn, onToggleSound, volume, onVolume, notify, onReset, currentArch, onBack }) {
  const updBio = (id, patch) => setBios((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const updHabit = (id, patch) => setHabits((hs) => hs.map((h) => (h.id === id ? { ...h, ...patch } : h)));

  const delBio = (id) => {
    if (bios.length <= 1) { notify("Keep at least one biosphere"); return; }
    const target = bios.find((x) => x.id !== id);
    const moved = habits.filter((h) => h.biosphereId === id).length;
    if (moved) setHabits((hs) => hs.map((h) => (h.biosphereId === id ? { ...h, biosphereId: target.id } : h)));
    setBios((bs) => bs.filter((b) => b.id !== id));
    notify(moved ? moved + (moved === 1 ? " habit moved to " : " habits moved to ") + target.name : "Biosphere removed");
  };
  const addBio = () => setBios((bs) => [...bs, { id: uid(), name: "New Biosphere", archetype: "forest", start: "17:00", purpose: "" }]);

  const delHabit = (id) => setHabits((hs) => hs.filter((h) => h.id !== id));
  const addHabit = () => {
    const first = [...bios].sort((a, b) => t2m(a.start) - t2m(b.start))[0];
    setHabits((hs) => [...hs, { id: uid(), name: "New habit", biosphereId: first.id, timer: null }]);
  };

  // two-step reset: arm, then confirm within 3 s
  const [armed, setArmed] = useState(false);
  const armT = useRef(null);
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

  const cap = { fontSize: 12.5, lineHeight: 1.6, color: "rgba(255,255,255,0.5)", marginTop: 10 };
  const nightClash = bios.some((b) => t2m(b.start) >= t2m(nightStart));

  return (
    <Shell kind={currentArch} title="Settings" sub="shape your day" onBack={onBack}>

      <SectionLabel>sound</SectionLabel>
      <div style={{ ...glassCard }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15 }}>Ambient sound</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>synthesized live, scene by scene</div>
          </div>
          <button
            onClick={onToggleSound}
            aria-pressed={soundOn}
            aria-label="Toggle ambient sound"
            style={{
              width: 46, height: 26, borderRadius: 999, flex: "none", padding: 0, cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.25)", position: "relative",
              background: soundOn ? "rgba(159,216,232,0.85)" : "rgba(255,255,255,0.08)",
              transition: "background .25s",
            }}
          >
            <span style={{ position: "absolute", top: 2, left: soundOn ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#f2f4f7", transition: "left .25s" }} />
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 16 }}>
          <Ic name="mute" size={15} style={{ opacity: 0.5, flex: "none" }} />
          <input
            type="range" className="bsRange" min={0} max={1} step={0.05}
            value={volume} onChange={(e) => onVolume(parseFloat(e.target.value))}
            aria-label="Volume" style={{ flex: 1 }}
          />
          <Ic name="sound" size={15} style={{ opacity: 0.8, flex: "none" }} />
        </div>
      </div>
      <div style={cap}>Every soundscape is generated live in your browser — nothing recorded, nothing downloaded.</div>

      <SectionLabel>biospheres</SectionLabel>
      {bios.map((b) => {
        const A = ARCH[b.archetype] || ARCH.night;
        return (
          <div key={b.id} style={{ ...glassCard, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: A.accent, flex: "none" }} />
              <input className="bsInput" style={{ flex: 1 }} value={b.name} placeholder="Name" aria-label="Biosphere name"
                onChange={(e) => updBio(b.id, { name: e.target.value })} />
              <input type="time" className="bsInput" style={{ width: 112, flex: "none" }} value={b.start} aria-label="Start time"
                onChange={(e) => updBio(b.id, { start: e.target.value })} />
              <button className="bsIcon" title="Remove biosphere" aria-label="Remove biosphere" onClick={() => delBio(b.id)}>
                <Ic name="trash" size={17} />
              </button>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
              <input className="bsInput" style={{ flex: 1 }} value={b.purpose} placeholder="Purpose (e.g. deep focus)" aria-label="Purpose"
                onChange={(e) => updBio(b.id, { purpose: e.target.value })} />
              <select className="bsSelect" style={{ width: 128, flex: "none" }} value={b.archetype} aria-label="Scene"
                onChange={(e) => updBio(b.id, { archetype: e.target.value })}>
                {ARCH_KEYS.map((k) => <option key={k} value={k}>{ARCH[k].label}</option>)}
              </select>
            </div>
          </div>
        );
      })}
      <div style={{ ...glassCard, marginBottom: 10, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ width: 10, height: 10, borderRadius: "50%", background: ARCH.night.accent, flex: "none" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15 }}>Grey Night</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>reflection begins</div>
        </div>
        <input type="time" className="bsInput" style={{ width: 112, flex: "none" }} value={nightStart} aria-label="Grey Night start"
          onChange={(e) => setNightStart(e.target.value)} />
      </div>
      <button className="bsBtn" onClick={addBio} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Ic name="plus" size={15} /> Add Biosphere
      </button>
      <div style={cap}>
        Grey Night should fall after your last biosphere.
        {nightClash ? <span style={{ color: "#ffcdb0" }}> Right now it doesn't — a biosphere starting at or after it will never appear as now.</span> : null}
      </div>

      <SectionLabel>habits</SectionLabel>
      {habits.length === 0 && (
        <div className="serif" style={{ fontStyle: "italic", color: "rgba(255,255,255,0.6)", fontSize: 16, marginBottom: 12 }}>
          No habits yet — plant one below.
        </div>
      )}
      {habits.map((h) => (
        <div key={h.id} style={{ ...glassCard, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input className="bsInput" style={{ flex: 1 }} value={h.name} placeholder="Habit" aria-label="Habit name"
              onChange={(e) => updHabit(h.id, { name: e.target.value })} />
            <button className="bsIcon" title="Remove habit" aria-label="Remove habit" onClick={() => delHabit(h.id)}>
              <Ic name="trash" size={17} />
            </button>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 10, alignItems: "center" }}>
            <select className="bsSelect" style={{ flex: 1 }} value={h.biosphereId} aria-label="Biosphere"
              onChange={(e) => updHabit(h.id, { biosphereId: e.target.value })}>
              {bios.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <input type="number" className="bsInput" style={{ width: 86, flex: "none" }} min={1} max={240} placeholder="—"
              value={h.timer == null ? "" : h.timer} aria-label="Timer minutes"
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") { updHabit(h.id, { timer: null }); return; }
                const n = Math.max(1, Math.min(240, parseInt(v, 10) || 1));
                updHabit(h.id, { timer: n });
              }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", flex: "none" }}>min</span>
          </div>
        </div>
      ))}
      <button className="bsBtn" onClick={addHabit} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Ic name="plus" size={15} /> Add Habit
      </button>

      <SectionLabel>data</SectionLabel>
      <div style={{ ...glassCard, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 170 }}>
          <div style={{ fontSize: 15 }}>Start over</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>Restore defaults and clear the journal</div>
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

/* ========================================================================== */
/*  ONBOARDING — the threshold                                                */
/* ========================================================================== */

function Onboard({ onEnter }) {
  const [snd, setSnd] = useState(true);
  return (
    <div className="bsRoot">
      <SceneCanvas kind="mountain" />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(5,7,11,0.55), rgba(5,7,11,0.76))" }} />
      <div className="bsScroll" style={{ position: "relative" }}>
        <div className="fadeIn" style={{ maxWidth: 420, margin: "0 auto", minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "40px 28px" }}>
          <div style={{ letterSpacing: "0.5em", fontWeight: 200, fontSize: 18, marginLeft: "0.5em" }}>BIOSPHERE</div>
          <div className="serif" style={{ fontStyle: "italic", fontSize: 21, color: "rgba(255,255,255,0.85)", marginTop: 14 }}>
            One day, lived in nature.
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.75, color: "rgba(255,255,255,0.75)", margin: "22px 0 30px" }}>
            Your day, arranged as landscapes. Habits rest inside each biosphere; when the Grey Night falls you reflect on them, one at a time, and seal the day.
          </p>
          <Pill on={snd} accent="#cfc0f2" onClick={() => setSnd((s) => !s)}>
            <span style={{ display: "inline-flex", verticalAlign: "-3px", marginRight: 8 }}>
              <Ic name={snd ? "sound" : "mute"} size={14} />
            </span>
            begin with ambient sound
          </Pill>
          <button className="bsBtn primary" style={{ marginTop: 26, padding: "13px 44px" }} onClick={() => onEnter(snd)}>
            Enter
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/*  APP — one day, wired together                                             */
/* ========================================================================== */

export default function App() {
  const [phase, setPhase] = useState("boot");                 // boot | onboard | app
  const [view, setView] = useState({ name: "home" });         // home | immersion{id} | night | journal | stats | settings
  const [bios, setBios] = useState(DEFAULT_BIOS);
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [nightStart, setNightStart] = useState(DEFAULT_NIGHT_START);
  const [journal, setJournal] = useState({});
  const [soundOn, setSoundOn] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [now, setNow] = useState(() => new Date());
  const [toast, setToast] = useState(null);
  const [pendingSound, setPendingSound] = useState(false);
  const [handoff, setHandoff] = useState(null);   // { toId, toName, accent, until }
  const [veil, setVeil] = useState(null);         // null | "in" | "out"
  const portalT = useRef([]);

  const loaded = useRef(false);
  const toastT = useRef(null);
  const archRef = useRef("night");
  const prevCur = useRef(null);

  const say = useCallback((msg) => {
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

  /* -- schedule resolution (FEATURE_SPEC §2) ------------------------------- */
  const sorted = useMemo(() => [...bios].sort((a, b) => t2m(a.start) - t2m(b.start)), [bios]);

  const sched = useMemo(() => {
    const nMin = now.getHours() * 60 + now.getMinutes();
    const nightM = t2m(nightStart);
    let currentId = "night";
    if (sorted.length && nMin < nightM && nMin >= t2m(sorted[0].start)) {
      for (let i = 0; i < sorted.length; i++) {
        if (t2m(sorted[i].start) <= nMin) currentId = sorted[i].id;
      }
    }
    const endOf = (id) => {
      const i = sorted.findIndex((b) => b.id === id);
      if (i === -1) return nightStart;
      return i + 1 < sorted.length ? sorted[i + 1].start : nightStart;
    };
    return { currentId, endOf, nMin };
  }, [sorted, nightStart, now]);

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
  const crossInto = useCallback((toId) => {
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

  const sealDay = useCallback((entries) => {
    const k = dayKey(now);
    setJournal((j) => {
      const nj = { ...j, [k]: { sealedAt: Date.now(), entries: entries } };
      store.set(JOURNAL_KEY, nj);
      return nj;
    });
    say("Day sealed ✦");
  }, [now, say]);

  const enterApp = useCallback((withSound) => {
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
