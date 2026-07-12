/* ========================================================================== */
/*  PROCEDURAL SOUND ENGINE — every soundscape is synthesized live            */
/*  (filtered noise, oscillators, envelopes). The one sanctioned recorded     */
/*  voice is the soundtrack layer (music.ts, ADR-8), which plays through      */
/*  its own bus here. Canonical recipes: docs/AUDIO_ENGINE.md.                */
/*                                                                            */
/*  Graph: scenes → sceneBus ─┐                                               */
/*         music  → musicBus ─┼→ master (volume) → destination                */
/*  Each layer is gated by its own bus; master carries only the volume.       */
/* ========================================================================== */

export interface SceneHandle {
  name: string;
  gain: GainNode;
  stops: Array<() => void>;
  timers: Array<ReturnType<typeof setTimeout>>;
  side?: number;
}

interface GrainOpts {
  f0?: number;
  f1?: number;
  q?: number;
  lp?: number;
  hp?: number;
  dur: number;
  peak: number;
}

interface GustTarget {
  p: AudioParam;
  base: number;
  peak: number;
}

export class AudioEngine {
  ctx: AudioContext | null;
  master: GainNode | null;
  sceneBus: GainNode | null;
  musicBus: GainNode | null;
  enabled: boolean;
  musicEnabled: boolean;
  volume: number;
  sceneName: string | null;
  current: SceneHandle | null;
  buffers: Record<string, AudioBuffer>;

  constructor() {
    this.ctx = null;
    this.master = null;
    this.sceneBus = null;
    this.musicBus = null;
    this.enabled = false;
    this.musicEnabled = false;
    this.volume = 0.7;
    this.sceneName = null;
    this.current = null;
    this.buffers = {};
  }

  supported() {
    return typeof window !== "undefined" && !!(window.AudioContext || (window as any).webkitAudioContext);
  }

  ensure() {
    if (!this.supported()) return false;
    if (!this.ctx) {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx!.createGain();
      this.master.gain.value = this.volume;
      this.master.connect(this.ctx!.destination);
      this.sceneBus = this.ctx!.createGain();
      this.sceneBus.gain.value = this.enabled ? 1 : 0;
      this.sceneBus.connect(this.master);
      this.musicBus = this.ctx!.createGain();
      this.musicBus.gain.value = this.musicEnabled ? 1 : 0;
      this.musicBus.connect(this.master);
    }
    if (this.ctx!.state === "suspended") {
      try {
        this.ctx!.resume();
      } catch (e) {}
    }
    return true;
  }

  noise(type: string) {
    if (this.buffers[type]) return this.buffers[type];
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * 2);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    if (type === "white") {
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    } else if (type === "pink") {
      let b0 = 0,
        b1 = 0,
        b2 = 0,
        b3 = 0,
        b4 = 0,
        b5 = 0,
        b6 = 0;
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
    } else {
      // brown
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

  setVolume(v: number) {
    this.volume = v;
    if (this.ctx) this.master!.gain.setTargetAtTime(v, this.ctx.currentTime, 0.15);
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!this.ensure()) return;
    const t = this.ctx!.currentTime;
    this.sceneBus!.gain.cancelScheduledValues(t);
    this.sceneBus!.gain.setTargetAtTime(on ? 1 : 0, t, 0.3);
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

  play(name: string) {
    this.sceneName = name;
    if (!this.enabled) return;
    if (!this.ensure()) return;
    if (this.current && this.current.name === name) return;
    this._fadeOut(this.current);
    this.current = this._build(name);
  }

  // gate the soundtrack bus; track scheduling itself lives in music.ts
  setMusicEnabled(on: boolean) {
    this.musicEnabled = on;
    if (!this.ctx) return; // the flag is applied when the context is born
    const t = this.ctx.currentTime;
    this.musicBus!.gain.cancelScheduledValues(t);
    this.musicBus!.gain.setTargetAtTime(on ? 1 : 0, t, 0.3);
  }

  stop() {
    this.sceneName = null;
    this._fadeOut(this.current);
    this.current = null;
  }

  chime() {
    // the chime is interface, not nature — it sounds if either layer is open
    if ((!this.enabled && !this.musicEnabled) || !this.ensure()) return;
    const ctx = this.ctx!;
    const t = ctx.currentTime + 0.02;
    const notes: Array<[number, number]> = [
      [659.25, 0],
      [880, 0.22],
    ];
    for (let i = 0; i < notes.length; i++) {
      const f = notes[i][0],
        off = notes[i][1];
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = f;
      const g = ctx.createGain();
      o.connect(g);
      g.connect(this.master!);
      g.gain.setValueAtTime(0.0001, t + off);
      g.gain.linearRampToValueAtTime(0.1, t + off + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + off + 1.4);
      o.start(t + off);
      o.stop(t + off + 1.6);
    }
  }

  /* ------------------------------ internals ------------------------------ */

  _fadeOut(cur: SceneHandle | null) {
    if (!cur) return;
    const t = this.ctx!.currentTime;
    try {
      cur.gain.gain.cancelScheduledValues(t);
      cur.gain.gain.setTargetAtTime(0, t, 0.5);
    } catch (e) {}
    cur.timers.forEach((id) => clearTimeout(id));
    cur.timers.length = 0;
    setTimeout(() => {
      cur.stops.forEach((f) => {
        try {
          f();
        } catch (e) {}
      });
      try {
        cur.gain.disconnect();
      } catch (e) {}
    }, 1800);
  }

  _build(name: string) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.value = 0;
    g.connect(this.sceneBus!);
    const scene: SceneHandle = { name: name, gain: g, stops: [], timers: [] };
    const fn = (this as any)["_" + name] as ((scene: SceneHandle) => void) | undefined;
    (fn || this._night).call(this, scene);
    g.gain.setTargetAtTime(1, ctx.currentTime + 0.05, 0.9);
    return scene;
  }

  _src(scene: SceneHandle, buffer: AudioBuffer) {
    const s = this.ctx!.createBufferSource();
    s.buffer = buffer;
    s.loop = true;
    s.start();
    scene.stops.push(() => s.stop());
    return s;
  }

  _lfo(scene: SceneHandle, rate: number, depth: number, base: number, param: AudioParam) {
    const o = this.ctx!.createOscillator();
    o.frequency.value = rate;
    const g = this.ctx!.createGain();
    g.gain.value = depth;
    o.connect(g);
    g.connect(param as any);
    param.value = base;
    o.start();
    scene.stops.push(() => o.stop());
  }

  _every(scene: SceneHandle, minS: number, maxS: number, fn: () => void) {
    const self = this;
    const loop = () => {
      const id = setTimeout(
        () => {
          if (self.enabled) {
            try {
              fn();
            } catch (e) {}
          }
          loop();
        },
        (minS + Math.random() * (maxS - minS)) * 1000
      );
      scene.timers.push(id);
    };
    loop();
  }

  _pan(scene: SceneHandle): AudioNode {
    if (typeof this.ctx!.createStereoPanner === "function") {
      const p = this.ctx!.createStereoPanner();
      p.pan.value = Math.random() * 1.4 - 0.7;
      p.connect(scene.gain);
      return p;
    }
    return scene.gain;
  }

  /* ---------------------- shared texture helpers ------------------------- */

  _panTo(scene: SceneHandle, v: number): AudioNode {
    if (typeof this.ctx!.createStereoPanner === "function") {
      const p = this.ctx!.createStereoPanner();
      p.pan.value = v;
      p.connect(scene.gain);
      return p;
    }
    return scene.gain;
  }

  // slow random walk of an AudioParam — kills the giveaway periodicity of LFOs
  _walk(
    scene: SceneHandle,
    param: AudioParam,
    base: number,
    spread: number,
    minS: number,
    maxS: number,
    tau: number
  ) {
    param.value = base;
    const self = this;
    this._every(scene, minS, maxS, () => {
      const v = Math.max(0.0001, base + (Math.random() * 2 - 1) * spread);
      param.setTargetAtTime(v, self.ctx!.currentTime, tau);
    });
  }

  // coherent gusts: several params swell and subside together, irregularly
  _gusts(
    scene: SceneHandle,
    targets: GustTarget[],
    minGap: number,
    maxGap: number,
    riseMin: number,
    riseMax: number,
    fallMin: number,
    fallMax: number
  ) {
    const self = this;
    this._every(scene, minGap, maxGap, () => {
      const t = self.ctx!.currentTime;
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
  _grain(out: AudioNode, when: number, noiseType: string, o: GrainOpts) {
    const ctx = this.ctx!;
    const s = ctx.createBufferSource();
    s.buffer = this.noise(noiseType);
    s.loop = true;
    s.playbackRate.value = 0.85 + Math.random() * 0.3;
    let node: AudioNode = s;
    if (o.f0) {
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.Q.value = o.q || 12;
      bp.frequency.setValueAtTime(o.f0, when);
      if (o.f1) bp.frequency.exponentialRampToValueAtTime(o.f1, when + o.dur);
      node.connect(bp);
      node = bp;
    }
    if (o.lp) {
      const f = ctx.createBiquadFilter();
      f.type = "lowpass";
      f.frequency.value = o.lp;
      node.connect(f);
      node = f;
    }
    if (o.hp) {
      const f = ctx.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = o.hp;
      node.connect(f);
      node = f;
    }
    const g = ctx.createGain();
    node.connect(g);
    g.connect(out);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(o.peak, when + Math.min(0.012, o.dur * 0.3));
    g.gain.exponentialRampToValueAtTime(0.0001, when + o.dur);
    s.start(when, Math.random() * 1.4);
    s.stop(when + o.dur + 0.08);
  }

  // an owl — the one voice in these worlds that truly holds a pitch
  _hoot(scene: SceneHandle, f: number, peak: number, echo: AudioNode | null) {
    const ctx = this.ctx!;
    const self = this;
    const one = (t: number, fq: number, dur: number) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(fq, t);
      o.frequency.exponentialRampToValueAtTime(fq * 0.93, t + dur);
      const g = ctx.createGain();
      o.connect(g);
      g.connect(scene.gain);
      if (echo) g.connect(echo);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(peak, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.start(t);
      o.stop(t + dur + 0.05);
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

  _tundra(scene: SceneHandle) {
    const ctx = this.ctx!;
    // body of the wind
    const n = this._src(scene, this.noise("pink"));
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.Q.value = 0.4;
    const g = ctx.createGain();
    g.gain.value = 0.16;
    n.connect(f);
    f.connect(g);
    g.connect(this._panTo(scene, -0.2));
    this._walk(scene, f.frequency, 520, 260, 1.4, 3.6, 1.1);
    // blowing snow — a high sizzle that breathes with the gusts
    const n2 = this._src(scene, this.noise("white"));
    const f2 = ctx.createBiquadFilter();
    f2.type = "bandpass";
    f2.Q.value = 1.1;
    const g2 = ctx.createGain();
    g2.gain.value = 0.014;
    n2.connect(f2);
    f2.connect(g2);
    g2.connect(this._panTo(scene, 0.25));
    this._walk(scene, f2.frequency, 1500, 550, 1.2, 3, 0.9);
    // the whistle only rises when the wind does
    const n3 = this._src(scene, this.noise("white"));
    const f3 = ctx.createBiquadFilter();
    f3.type = "bandpass";
    f3.Q.value = 14;
    const g3 = ctx.createGain();
    g3.gain.value = 0.003;
    n3.connect(f3);
    f3.connect(g3);
    g3.connect(scene.gain);
    this._walk(scene, f3.frequency, 1350, 550, 0.9, 2.4, 0.7);
    this._gusts(
      scene,
      [
        { p: g.gain, base: 0.16, peak: 0.4 },
        { p: g2.gain, base: 0.014, peak: 0.05 },
        { p: g3.gain, base: 0.003, peak: 0.026 },
      ],
      5,
      13,
      1.2,
      2.6,
      2.6,
      5.5
    );
  }

  _volcanic(scene: SceneHandle) {
    const ctx = this.ctx!;
    const self = this;
    // tectonic floor, breathing
    const n = this._src(scene, this.noise("brown"));
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.Q.value = 0.7;
    const g = ctx.createGain();
    g.gain.value = 0.3;
    n.connect(f);
    f.connect(g);
    g.connect(scene.gain);
    this._walk(scene, f.frequency, 92, 30, 2, 5, 1.6);
    this._gusts(scene, [{ p: g.gain, base: 0.3, peak: 0.52 }], 7, 16, 1.8, 3.5, 3, 6);
    // steam vents, far right
    const n2 = this._src(scene, this.noise("white"));
    const f2 = ctx.createBiquadFilter();
    f2.type = "highpass";
    f2.frequency.value = 6200;
    const g2 = ctx.createGain();
    n2.connect(f2);
    f2.connect(g2);
    g2.connect(this._panTo(scene, 0.3));
    this._walk(scene, g2.gain, 0.006, 0.004, 1.5, 4, 1.2);
    // deep resonant knocks from below — rock, not tone
    this._every(scene, 9, 21, () => {
      const t = ctx.currentTime + 0.03;
      self._grain(scene.gain, t, "brown", { f0: 52 + Math.random() * 22, q: 6, dur: 0.4, peak: 0.5 });
      if (Math.random() < 0.4)
        self._grain(scene.gain, t + 0.25 + Math.random() * 0.3, "brown", {
          f0: 48 + Math.random() * 18,
          q: 6,
          dur: 0.3,
          peak: 0.28,
        });
    });
    // ember crackle — clustered, varied, the occasional deeper pop
    this._every(scene, 0.28, 0.95, () => {
      if (Math.random() < 0.35) return;
      const t0 = ctx.currentTime + 0.02;
      const count = Math.random() < 0.3 ? 2 + Math.floor(Math.random() * 3) : 1;
      const out = self._pan(scene);
      for (let i = 0; i < count; i++) {
        const t = t0 + i * (0.03 + Math.random() * 0.07);
        if (Math.random() < 0.22)
          self._grain(out, t, "white", { lp: 900, dur: 0.03 + Math.random() * 0.03, peak: 0.02 });
        else
          self._grain(out, t, "white", {
            hp: 2600 + Math.random() * 2600,
            dur: 0.01 + Math.random() * 0.035,
            peak: 0.006 + Math.random() * 0.014,
          });
      }
    });
  }

  _seaside(scene: SceneHandle) {
    const ctx = this.ctx!;
    const self = this;
    // distant surf, always there
    const n = this._src(scene, this.noise("pink"));
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.Q.value = 0.5;
    const g = ctx.createGain();
    n.connect(f);
    f.connect(g);
    g.connect(scene.gain);
    this._walk(scene, f.frequency, 320, 110, 2, 5, 1.6);
    this._walk(scene, g.gain, 0.1, 0.03, 2.5, 6, 2);
    // sea air
    const n2 = this._src(scene, this.noise("white"));
    const f2 = ctx.createBiquadFilter();
    f2.type = "highpass";
    f2.frequency.value = 7000;
    const g2 = ctx.createGain();
    n2.connect(f2);
    f2.connect(g2);
    g2.connect(scene.gain);
    this._walk(scene, g2.gain, 0.004, 0.0025, 2, 5, 1.5);
    // each wave: gather → break → wash, alternating across the water
    scene.side = 1;
    const wave = () => {
      const t = ctx.currentTime + 0.05;
      const k = 0.55 + Math.random() * 0.45;
      const rise = 2 + Math.random() * 1.8;
      const wash = 3 + Math.random() * 3.5;
      scene.side = -scene.side!;
      const out = self._panTo(scene, scene.side * (0.15 + Math.random() * 0.25));
      const s = ctx.createBufferSource();
      s.buffer = self.noise("white");
      s.loop = true;
      const bf = ctx.createBiquadFilter();
      bf.type = "lowpass";
      bf.Q.value = 0.6;
      const bg = ctx.createGain();
      s.connect(bf);
      bf.connect(bg);
      bg.connect(out);
      bf.frequency.setValueAtTime(240, t);
      bf.frequency.exponentialRampToValueAtTime(1500, t + rise);
      bf.frequency.exponentialRampToValueAtTime(360, t + rise + wash);
      bg.gain.setValueAtTime(0.0001, t);
      bg.gain.linearRampToValueAtTime(0.26 * k, t + rise);
      bg.gain.exponentialRampToValueAtTime(0.0001, t + rise + wash);
      s.start(t, Math.random() * 1.4);
      s.stop(t + rise + wash + 0.1);
      const s2 = ctx.createBufferSource();
      s2.buffer = self.noise("white");
      s2.loop = true;
      const hf = ctx.createBiquadFilter();
      hf.type = "highpass";
      hf.frequency.value = 1700;
      const hg = ctx.createGain();
      s2.connect(hf);
      hf.connect(hg);
      hg.connect(out);
      hg.gain.setValueAtTime(0.0001, t + rise - 0.1);
      hg.gain.linearRampToValueAtTime(0.2 * k, t + rise + 0.12);
      hg.gain.exponentialRampToValueAtTime(0.0001, t + rise + wash * 0.9);
      s2.start(t + rise - 0.1, Math.random() * 1.4);
      s2.stop(t + rise + wash + 0.1);
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

  _forest(scene: SceneHandle) {
    const ctx = this.ctx!;
    const self = this;
    // hush of the woods
    const n0 = this._src(scene, this.noise("brown"));
    const f0 = ctx.createBiquadFilter();
    f0.type = "lowpass";
    f0.frequency.value = 220;
    const g0 = ctx.createGain();
    g0.gain.value = 0.035;
    n0.connect(f0);
    f0.connect(g0);
    g0.connect(scene.gain);
    // canopy — leaves in moving air
    const n = this._src(scene, this.noise("pink"));
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 0.8;
    const g = ctx.createGain();
    g.gain.value = 0.06;
    n.connect(f);
    f.connect(g);
    g.connect(this._panTo(scene, -0.15));
    this._walk(scene, f.frequency, 1700, 700, 1.3, 3.2, 1);
    // leaf sizzle riding the gusts
    const n2 = this._src(scene, this.noise("white"));
    const f2 = ctx.createBiquadFilter();
    f2.type = "highpass";
    f2.frequency.value = 3200;
    const g2 = ctx.createGain();
    g2.gain.value = 0.002;
    n2.connect(f2);
    f2.connect(g2);
    g2.connect(this._panTo(scene, 0.2));
    this._gusts(
      scene,
      [
        { p: g.gain, base: 0.06, peak: 0.15 },
        { p: g2.gain, base: 0.002, peak: 0.028 },
      ],
      6,
      14,
      1.4,
      2.8,
      2.5,
      5
    );
    // birdsong — noise-born chirps, phrased, placed among the trees
    const phrase = (far: boolean) => {
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

  _mountain(scene: SceneHandle) {
    const ctx = this.ctx!;
    const self = this;
    // thin air moving over stone
    const n = this._src(scene, this.noise("pink"));
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 0.6;
    const g = ctx.createGain();
    g.gain.value = 0.05;
    n.connect(f);
    f.connect(g);
    g.connect(this._panTo(scene, -0.15));
    this._walk(scene, f.frequency, 750, 300, 1.6, 4, 1.3);
    // altitude sizzle
    const n2 = this._src(scene, this.noise("white"));
    const f2 = ctx.createBiquadFilter();
    f2.type = "highpass";
    f2.frequency.value = 4000;
    const g2 = ctx.createGain();
    g2.gain.value = 0.004;
    n2.connect(f2);
    f2.connect(g2);
    g2.connect(this._panTo(scene, 0.2));
    // long alpine waves of wind
    this._gusts(
      scene,
      [
        { p: g.gain, base: 0.05, peak: 0.16 },
        { p: g2.gain, base: 0.004, peak: 0.018 },
      ],
      8,
      18,
      2,
      4,
      4,
      8
    );
    // the valley answers: a soft echo, kept for living voices
    const dl = ctx.createDelay(1.5);
    dl.delayTime.value = 0.58;
    const fb = ctx.createGain();
    fb.gain.value = 0.42;
    const damp = ctx.createBiquadFilter();
    damp.type = "lowpass";
    damp.frequency.value = 1100;
    dl.connect(damp);
    damp.connect(fb);
    fb.connect(dl);
    const wet = ctx.createGain();
    wet.gain.value = 0.45;
    dl.connect(wet);
    wet.connect(scene.gain);
    // an owl at dusk, rarely
    this._every(scene, 24, 55, () => self._hoot(scene, 350, 0.028, dl));
  }

  _night(scene: SceneHandle) {
    const ctx = this.ctx!;
    const self = this;
    // the dark itself
    const n = this._src(scene, this.noise("brown"));
    const f = ctx.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 130;
    const g = ctx.createGain();
    n.connect(f);
    f.connect(g);
    g.connect(scene.gain);
    this._walk(scene, g.gain, 0.04, 0.015, 2.5, 6, 2);
    // night breeze
    const n2 = this._src(scene, this.noise("pink"));
    const f2 = ctx.createBiquadFilter();
    f2.type = "bandpass";
    f2.Q.value = 0.7;
    const g2 = ctx.createGain();
    g2.gain.value = 0.02;
    n2.connect(f2);
    f2.connect(g2);
    g2.connect(scene.gain);
    this._walk(scene, f2.frequency, 600, 240, 1.8, 4.5, 1.4);
    this._gusts(scene, [{ p: g2.gain, base: 0.02, peak: 0.06 }], 12, 26, 2, 4, 4, 8);
    // the cricket chorus — two trilling voices, left and right
    const trill = (fq: number, rate: number, base: number, pan: number) => {
      const s = self._src(scene, self.noise("white"));
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.Q.value = 26;
      bp.frequency.value = fq;
      const tg = ctx.createGain();
      s.connect(bp);
      bp.connect(tg);
      tg.connect(self._panTo(scene, pan));
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
        const co = ctx.createOscillator();
        co.type = "sine";
        co.frequency.value = fq;
        const cg = ctx.createGain();
        co.connect(cg);
        cg.connect(out);
        cg.gain.setValueAtTime(0.0001, t);
        cg.gain.linearRampToValueAtTime(0.006, t + 0.006);
        cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
        co.start(t);
        co.stop(t + 0.03);
      }
    });
    // an owl far across the dark
    this._every(scene, 40, 90, () => self._hoot(scene, 300, 0.014, null));
  }
}

export const AUDIO = new AudioEngine();
