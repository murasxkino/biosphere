import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AudioEngine } from "./engine";

/* A recording mock of the Web Audio API: graph construction only, no sound.
   Node topology per recipe is what the tests assert (docs/AUDIO_ENGINE.md);
   how it sounds is M4's by-ear work. */

class MockParam {
  value = 0;
  calls: Array<{ fn: string; args: any[] }> = [];
  _rec(fn: string, args: any[]) {
    this.calls.push({ fn, args });
  }
  setValueAtTime(...a: any[]) {
    this._rec("setValueAtTime", a);
  }
  linearRampToValueAtTime(...a: any[]) {
    this._rec("linearRampToValueAtTime", a);
  }
  exponentialRampToValueAtTime(...a: any[]) {
    this._rec("exponentialRampToValueAtTime", a);
  }
  setTargetAtTime(...a: any[]) {
    this._rec("setTargetAtTime", a);
  }
  cancelScheduledValues(...a: any[]) {
    this._rec("cancelScheduledValues", a);
  }
}

class MockNode {
  kind: string;
  ctx: MockCtx;
  outputs: any[] = [];
  constructor(ctx: MockCtx, kind: string) {
    this.ctx = ctx;
    this.kind = kind;
    ctx.created[kind] = ctx.created[kind] || [];
    ctx.created[kind].push(this);
  }
  connect(to: any) {
    this.outputs.push(to);
  }
  disconnect() {}
}

class MockCtx {
  created: Record<string, MockNode[]> = {};
  sampleRate = 8000; // small buffers keep noise generation fast
  currentTime = 0;
  state = "running";
  destination = { kind: "destination" };
  resume() {}
  createGain() {
    const n: any = new MockNode(this, "gain");
    n.gain = new MockParam();
    return n;
  }
  createBiquadFilter() {
    const n: any = new MockNode(this, "biquad");
    n.type = "";
    n.frequency = new MockParam();
    n.Q = new MockParam();
    return n;
  }
  createBufferSource() {
    const n: any = new MockNode(this, "source");
    n.buffer = null;
    n.loop = false;
    n.playbackRate = new MockParam();
    n.start = vi.fn();
    n.stop = vi.fn();
    return n;
  }
  createOscillator() {
    const n: any = new MockNode(this, "osc");
    n.type = "";
    n.frequency = new MockParam();
    n.start = vi.fn();
    n.stop = vi.fn();
    return n;
  }
  createStereoPanner() {
    const n: any = new MockNode(this, "panner");
    n.pan = new MockParam();
    return n;
  }
  createDelay() {
    const n: any = new MockNode(this, "delay");
    n.delayTime = new MockParam();
    return n;
  }
  createBuffer(_ch: number, len: number, _rate: number) {
    return { getChannelData: () => new Float32Array(len) };
  }
  filtersOfType(t: string) {
    return (this.created.biquad || []).filter((f: any) => f.type === t);
  }
}

let engine: AudioEngine;

const ctxOf = (e: AudioEngine) => e.ctx as unknown as MockCtx;

beforeEach(() => {
  vi.useFakeTimers();
  (window as any).AudioContext = MockCtx;
  engine = new AudioEngine();
});

afterEach(() => {
  engine.stop();
  vi.clearAllTimers();
  vi.useRealTimers();
  delete (window as any).AudioContext;
});

describe("capability gating", () => {
  it("is unsupported without an AudioContext, and every entry point no-ops safely", () => {
    delete (window as any).AudioContext;
    const e = new AudioEngine();
    expect(e.supported()).toBe(false);
    expect(() => {
      e.setEnabled(true);
      e.play("tundra");
      e.chime();
      e.setVolume(0.5);
      e.stop();
    }).not.toThrow();
    expect(e.ctx).toBeNull();
  });
});

describe("master chain and lifecycle", () => {
  it("lazily creates master (volume) + per-layer buses (gated 0 while off) wired to destination", () => {
    engine.ensure();
    const ctx = ctxOf(engine);
    expect(ctx.created.gain).toHaveLength(3); // master + sceneBus + musicBus
    expect((engine.master as any).gain.value).toBe(0.7); // master carries only the volume
    expect((engine.master as any).outputs).toContain(ctx.destination);
    expect((engine.sceneBus as any).gain.value).toBe(0); // each layer gated by its own bus
    expect((engine.musicBus as any).gain.value).toBe(0);
    expect((engine.sceneBus as any).outputs).toContain(engine.master);
    expect((engine.musicBus as any).outputs).toContain(engine.master);
  });

  it("play() before enable stores the scene name but builds nothing", () => {
    engine.play("tundra");
    expect(engine.sceneName).toBe("tundra");
    expect(engine.current).toBeNull();
  });

  it("setEnabled(true) glides the scene bus open and builds the pending scene", () => {
    engine.play("forest");
    engine.setEnabled(true);
    const bus: any = engine.sceneBus;
    const glide = bus.gain.calls.find((c: any) => c.fn === "setTargetAtTime");
    expect(glide.args[0]).toBe(1);
    expect(engine.current!.name).toBe("forest");
  });

  it("setMusicEnabled gates only the music bus; scenes are untouched", () => {
    engine.ensure();
    engine.setMusicEnabled(true);
    const bus: any = engine.musicBus;
    const glide = bus.gain.calls.find((c: any) => c.fn === "setTargetAtTime");
    expect(glide.args[0]).toBe(1);
    expect(engine.current).toBeNull();
    engine.setMusicEnabled(false);
    const last = bus.gain.calls.filter((c: any) => c.fn === "setTargetAtTime").pop();
    expect(last.args[0]).toBe(0);
  });

  it("setMusicEnabled before any context only records the flag, applied at birth", () => {
    engine.setMusicEnabled(true);
    expect(engine.ctx).toBeNull();
    engine.ensure();
    expect((engine.musicBus as any).gain.value).toBe(1);
  });

  it("layer levels: the gates open to the set level, not to 1", () => {
    engine.setSceneLevel(0.6);
    engine.setMusicLevel(0.3);
    engine.setEnabled(true);
    engine.setMusicEnabled(true);
    const sceneGlide = (engine.sceneBus as any).gain.calls
      .filter((c: any) => c.fn === "setTargetAtTime")
      .pop();
    const musicGlide = (engine.musicBus as any).gain.calls
      .filter((c: any) => c.fn === "setTargetAtTime")
      .pop();
    expect(sceneGlide.args[0]).toBe(0.6);
    expect(musicGlide.args[0]).toBe(0.3);
  });

  it("re-leveling an open layer glides it live; a closed layer only remembers", () => {
    engine.setEnabled(true);
    engine.setSceneLevel(0.4);
    const live = (engine.sceneBus as any).gain.calls.filter((c: any) => c.fn === "setTargetAtTime").pop();
    expect(live.args[0]).toBe(0.4);
    const before = (engine.musicBus as any).gain.calls.length;
    engine.setMusicLevel(0.2); // music layer is closed — no glide, just the field
    expect((engine.musicBus as any).gain.calls.length).toBe(before);
    expect(engine.musicLevel).toBe(0.2);
    engine.setMusicEnabled(true); // opening it lands on the remembered level
    const open = (engine.musicBus as any).gain.calls.filter((c: any) => c.fn === "setTargetAtTime").pop();
    expect(open.args[0]).toBe(0.2);
  });

  it("crossfades on scene change: old gain fades to 0, its timers clear, new scene builds", () => {
    engine.setEnabled(true);
    engine.play("tundra");
    const old = engine.current!;
    expect(old.timers.length).toBeGreaterThan(0);
    engine.play("night");
    const fade = (old.gain.gain as unknown as MockParam).calls
      .filter((c) => c.fn === "setTargetAtTime")
      .pop()!;
    expect(fade.args[0]).toBe(0);
    expect(old.timers).toHaveLength(0);
    expect(engine.current!.name).toBe("night");
  });

  it("play() with the same scene is a no-op", () => {
    engine.setEnabled(true);
    engine.play("tundra");
    const cur = engine.current;
    engine.play("tundra");
    expect(engine.current).toBe(cur);
  });

  it("stop() releases the scene", () => {
    engine.setEnabled(true);
    engine.play("tundra");
    engine.stop();
    expect(engine.current).toBeNull();
    expect(engine.sceneName).toBeNull();
  });

  it("caches one noise buffer per color", () => {
    engine.setEnabled(true);
    engine.play("tundra");
    engine.play("seaside");
    expect(Object.keys(engine.buffers).sort()).toEqual(expect.arrayContaining(["pink", "white"]));
    const pink = engine.buffers.pink;
    engine.play("forest");
    expect(engine.buffers.pink).toBe(pink); // reused, not regenerated
  });
});

describe("chime — the app's one interface voice", () => {
  it("builds two enveloped sine oscillators into the master", () => {
    engine.setEnabled(true);
    const ctx = ctxOf(engine);
    const before = (ctx.created.osc || []).length;
    engine.chime();
    const oscs = ctx.created.osc.slice(before);
    expect(oscs).toHaveLength(2);
    expect((oscs[0] as any).frequency.value).toBeCloseTo(659.25); // E5
    expect((oscs[1] as any).frequency.value).toBe(880); // A5
    oscs.forEach((o: any) => expect(o.start).toHaveBeenCalled());
  });

  it("sounds if either layer is open, and stays silent when both are closed", () => {
    engine.setMusicEnabled(true); // music only — the chime still speaks
    engine.ensure();
    const ctx = ctxOf(engine);
    engine.chime();
    expect((ctx.created.osc || []).length).toBe(2);
    engine.setMusicEnabled(false);
    engine.chime(); // both layers closed — silence
    expect((ctx.created.osc || []).length).toBe(2);
  });
});

/* Graph construction per scene, against the canonical recipes. */
describe("soundscape graph construction", () => {
  const build = (name: string) => {
    engine.setEnabled(true);
    engine.play(name);
    return ctxOf(engine);
  };

  it("tundra: three noise beds — lowpass wind body + two bandpass layers (snow, whistle Q14) — with gusts scheduled", () => {
    const ctx = build("tundra");
    expect(ctx.created.source).toHaveLength(3);
    expect(ctx.filtersOfType("lowpass")).toHaveLength(1);
    const bps = ctx.filtersOfType("bandpass");
    expect(bps).toHaveLength(2);
    expect(bps.map((f: any) => f.Q.value)).toEqual(expect.arrayContaining([1.1, 14]));
    expect((ctx.created.panner || []).length).toBeGreaterThanOrEqual(2);
    expect(engine.current!.timers.length).toBeGreaterThan(0); // walks + gusts live on timers
  });

  it("volcanic: brown floor through a lowpass + highpassed steam at 6.2 kHz", () => {
    const ctx = build("volcanic");
    expect(ctx.created.source).toHaveLength(2);
    expect(ctx.filtersOfType("lowpass")).toHaveLength(1);
    const hp = ctx.filtersOfType("highpass");
    expect(hp).toHaveLength(1);
    expect((hp[0] as any).frequency.value).toBe(6200);
  });

  it("seaside: surf + sea-air beds plus the first wave (two swept sources) already gathering", () => {
    const ctx = build("seaside");
    expect(ctx.created.source).toHaveLength(4); // 2 beds + 2 wave layers
    expect(ctx.filtersOfType("lowpass").length).toBeGreaterThanOrEqual(2);
    expect(ctx.filtersOfType("highpass").length).toBeGreaterThanOrEqual(2);
    const waveSrc: any = ctx.created.source[2];
    expect(waveSrc.start).toHaveBeenCalled();
    expect(waveSrc.stop).toHaveBeenCalled(); // waves end; beds run forever
  });

  it("forest: floor hush + canopy bandpass + leaf-sizzle highpass at 3.2 kHz", () => {
    const ctx = build("forest");
    expect(ctx.created.source).toHaveLength(3);
    expect(ctx.filtersOfType("lowpass")).toHaveLength(1);
    expect(ctx.filtersOfType("bandpass")).toHaveLength(1);
    const hp = ctx.filtersOfType("highpass");
    expect(hp).toHaveLength(1);
    expect((hp[0] as any).frequency.value).toBe(3200);
  });

  it("mountain: two wind beds + the valley echo (feedback delay, damped, wet into the scene)", () => {
    const ctx = build("mountain");
    expect(ctx.created.source).toHaveLength(2);
    expect(ctx.created.delay).toHaveLength(1);
    const dl: any = ctx.created.delay[0];
    expect(dl.delayTime.value).toBe(0.58);
    const damp = ctx.filtersOfType("lowpass").find((f: any) => f.frequency.value === 1100);
    expect(damp).toBeTruthy();
    expect(dl.outputs).toContain(damp); // delay -> damping -> feedback loop
  });

  it("night: dark floor + breeze + two continuous cricket trills (Q 26 bandpass, AM by true LFOs)", () => {
    const ctx = build("night");
    expect(ctx.created.source).toHaveLength(4); // dark, breeze, two trills
    const trills = ctx.filtersOfType("bandpass").filter((f: any) => f.Q.value === 26);
    expect(trills).toHaveLength(2);
    expect(trills.map((f: any) => f.frequency.value)).toEqual(expect.arrayContaining([4300, 4650]));
    expect((ctx.created.osc || []).length).toBe(2); // the trill LFOs — crickets genuinely trill
  });

  it("every scene stays within the persistent-node budget (≤ ~12 sources+oscillators)", () => {
    for (const name of ["tundra", "volcanic", "seaside", "forest", "mountain", "night"]) {
      const e = new AudioEngine();
      e.setEnabled(true);
      e.play(name);
      expect(e.current!.stops.length, name).toBeLessThanOrEqual(12);
      e.stop();
    }
  });
});
