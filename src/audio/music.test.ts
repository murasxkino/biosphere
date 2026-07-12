import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { AudioEngine } from "./engine";
import { MusicPlayer } from "./music";

/* A recording mock, like engine.test.ts: graph construction and scheduling
   only, no sound. The seam crossfade's audible quality is by-ear M4 work. */

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
  setValueCurveAtTime(...a: any[]) {
    this._rec("setValueCurveAtTime", a);
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
  outputs: any[] = [];
  constructor(ctx: MockCtx, kind: string) {
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
  created: Record<string, any[]> = {};
  sampleRate = 8000;
  currentTime = 0;
  state = "running";
  destination = { kind: "destination" };
  decodedDuration = 10; // seam 1.25 s, cycle 8.75 s
  resume() {}
  createGain() {
    const n: any = new MockNode(this, "gain");
    n.gain = new MockParam();
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
  createBuffer(_ch: number, len: number) {
    return { getChannelData: () => new Float32Array(len) };
  }
  async decodeAudioData(_bytes: ArrayBuffer) {
    return { duration: this.decodedDuration } as AudioBuffer;
  }
}

const TRACKS: Record<string, string | null> = {
  tundra: "/music/tundra.wav?v=1",
  forest: "/music/forest.wav?v=1",
  seaside: "/music/seaside.wav?v=1",
  volcanic: null,
};

let engine: AudioEngine;
let player: MusicPlayer;
let fetchMock: ReturnType<typeof vi.fn>;

const ctxOf = () => engine.ctx as unknown as MockCtx;

beforeEach(() => {
  vi.useFakeTimers();
  (window as any).AudioContext = MockCtx;
  fetchMock = vi.fn(async () => ({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) }));
  vi.stubGlobal("fetch", fetchMock);
  engine = new AudioEngine();
  player = new MusicPlayer(engine, TRACKS);
});

afterEach(() => {
  player.stop();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  delete (window as any).AudioContext;
});

describe("availability", () => {
  it("follows the manifest: a path means scored, null or unknown means unscored", () => {
    expect(player.available("tundra")).toBe(true);
    expect(player.available("volcanic")).toBe(false);
    expect(player.available("nowhere")).toBe(false);
  });

  it("does not exist inside the artifact sandbox (window.storage present)", () => {
    (window as any).storage = {};
    expect(player.available("tundra")).toBe(false);
    delete (window as any).storage;
  });
});

describe("playback", () => {
  it("fetches the manifest URL, decodes once, and wires source → gain → track → musicBus", async () => {
    await player.play("tundra");
    expect(fetchMock).toHaveBeenCalledWith("/music/tundra.wav?v=1");
    const ctx = ctxOf();
    expect(player.current!.arch).toBe("tundra");
    const src: any = ctx.created.source[0];
    expect(src.start).toHaveBeenCalled();
    const srcGain = src.outputs[0];
    expect(srcGain.kind).toBe("gain");
    expect(srcGain.outputs).toContain(player.current!.gain);
    expect((player.current!.gain as any).outputs).toContain(engine.musicBus);
    const glide = (player.current!.gain as any).gain.calls.find(
      (c: any) => c.fn === "setTargetAtTime"
    );
    expect(glide.args[0]).toBe(1); // the world-entry fade
  });

  it("replaying the same archetype is a no-op", async () => {
    await player.play("tundra");
    const cur = player.current;
    await player.play("tundra");
    expect(player.current).toBe(cur);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps one future pass in flight, joined by equal-power curves", async () => {
    await player.play("tundra");
    const ctx = ctxOf();
    expect(ctx.created.source).toHaveLength(2); // the current pass and the next, pre-scheduled
    const first: any = ctx.created.source[0];
    // the first pass enters at full level and only fades at its tail
    const g1: any = first.outputs[0];
    expect(g1.gain.calls.some((c: any) => c.fn === "setValueAtTime" && c.args[0] === 1)).toBe(true);
    expect(g1.gain.calls.filter((c: any) => c.fn === "setValueCurveAtTime")).toHaveLength(1);
    const second: any = ctx.created.source[1];
    const g2: any = second.outputs[0];
    // every later pass rises on a curve and falls on one
    expect(g2.gain.calls.filter((c: any) => c.fn === "setValueCurveAtTime")).toHaveLength(2);
    expect(second.start).toHaveBeenCalled();
    expect(second.stop).toHaveBeenCalled(); // every pass ends; the piece continues
  });

  it("advances on the audio clock: a finished pass chains the next, never a timer", async () => {
    await player.play("tundra");
    const ctx = ctxOf();
    const first: any = ctx.created.source[0];
    expect(typeof first.onended).toBe("function");
    first.onended(); // the audio graph reports the pass complete
    expect(ctx.created.source).toHaveLength(3); // a new future pass appears
    player.stop();
    const count = ctx.created.source.length;
    const second: any = ctx.created.source[1];
    if (second.onended) second.onended(); // a stale end must not resurrect the chain
    expect(ctx.created.source).toHaveLength(count);
  });

  it("crossfades between worlds: the old track fades and its sources stop, unhooked", async () => {
    await player.play("tundra");
    const old = player.current!;
    await player.play("forest");
    expect(player.current!.arch).toBe("forest");
    const fade = (old.gain as any).gain.calls.filter((c: any) => c.fn === "setTargetAtTime").pop();
    expect(fade.args[0]).toBe(0);
    vi.advanceTimersByTime(1800);
    old.sources.forEach((s: any) => {
      expect(s.stop).toHaveBeenCalled();
      expect(s.onended).toBeNull(); // stopping must not chain another pass
    });
  });

  it("an unavailable world silences the current track", async () => {
    await player.play("tundra");
    await player.play("volcanic"); // unscored
    expect(player.current).toBeNull();
  });

  it("stop() releases everything", async () => {
    await player.play("tundra");
    const h = player.current!;
    player.stop();
    expect(player.current).toBeNull();
    vi.advanceTimersByTime(1800);
    h.sources.forEach((s: any) => expect(s.stop).toHaveBeenCalled());
  });
});

describe("resilience & memory", () => {
  it("a failed fetch stays silent — no throw, nothing playing", async () => {
    fetchMock.mockRejectedValueOnce(new Error("offline"));
    await expect(player.play("tundra")).resolves.toBeUndefined();
    expect(player.current).toBeNull();
  });

  it("a non-OK response stays silent too", async () => {
    fetchMock.mockResolvedValueOnce({ ok: false });
    await player.play("tundra");
    expect(player.current).toBeNull();
  });

  it("a slow load that was superseded never plays over its successor, but keeps its decode", async () => {
    let releaseTundra!: (v: any) => void;
    fetchMock.mockImplementationOnce(
      () => new Promise((res) => (releaseTundra = res)) // tundra stalls
    );
    const p1 = player.play("tundra");
    await player.play("forest"); // the user has moved on
    releaseTundra({ ok: true, arrayBuffer: async () => new ArrayBuffer(8) });
    await p1;
    expect(player.current!.arch).toBe("forest");
    expect(player.cache.has("tundra")).toBe(true); // the work is not thrown away
  });

  it("keeps at most two decoded tracks in memory", async () => {
    await player.play("tundra");
    await player.play("forest");
    await player.play("seaside");
    expect(player.cache.size).toBeLessThanOrEqual(2);
    expect(player.cache.has("seaside")).toBe(true); // the current world is always kept
  });
});
