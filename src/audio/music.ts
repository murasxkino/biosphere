/* ========================================================================== */
/*  SOUNDTRACK LAYER — the one recorded voice in these worlds (ADR-8).        */
/*  One looped piece per archetype, played only inside immersion. The pieces  */
/*  are not authored as perfect loops, so each pass is joined to the next by  */
/*  an equal-power crossfade at the seam — a crossfade, never a cut.          */
/*  Soundscapes remain synthesized live; this module alone touches files.     */
/* ========================================================================== */

import { AUDIO, AudioEngine } from "./engine";
import { MUSIC_TRACKS } from "./tracks";
import type { Track } from "./tracks";

const SEAM_MAX_S = 3; // seconds of tail/head overlap hiding the loop seam
const CACHE_MAX = 2; // decoded tracks held in memory (current + previous)

interface TrackHandle {
  arch: string;
  gain: GainNode;
  sources: AudioBufferSourceNode[];
}

// equal-power quarter curves — a linear crossfade dips mid-seam; these do not
const CURVE_N = 33;
const RISE = new Float32Array(CURVE_N);
const FALL = new Float32Array(CURVE_N);
for (let i = 0; i < CURVE_N; i++) {
  const x = (i / (CURVE_N - 1)) * (Math.PI / 2);
  RISE[i] = Math.sin(x);
  FALL[i] = Math.cos(x);
}

// the artifact sandbox cannot serve files, so the soundtrack quietly does not
// exist there — detected by the same signal storage/adapter.ts prefers
const inArtifact = () =>
  typeof window !== "undefined" && typeof (window as any).storage !== "undefined";

export class MusicPlayer {
  engine: AudioEngine;
  tracks: Record<string, Track | null>;
  cache: Map<string, AudioBuffer>;
  current: TrackHandle | null;
  seq: number;

  constructor(engine: AudioEngine, tracks: Record<string, Track | null> = MUSIC_TRACKS) {
    this.engine = engine;
    this.tracks = tracks;
    this.cache = new Map();
    this.current = null;
    this.seq = 0;
  }

  available(arch: string) {
    return !!this.tracks[arch] && !inArtifact();
  }

  async play(arch: string) {
    if (!this.available(arch)) {
      this.stop();
      return;
    }
    if (this.current && this.current.arch === arch) return;
    const entry = this.tracks[arch]!;
    const token = ++this.seq;
    if (!this.engine.ensure()) return;
    let buf = this.cache.get(arch);
    if (buf) {
      this.cache.delete(arch); // refresh its place in the eviction order
      this.cache.set(arch, buf);
    } else {
      try {
        const res = await fetch(entry.url);
        if (!res.ok) return;
        const bytes = await res.arrayBuffer();
        buf = await this.engine.ctx!.decodeAudioData(bytes);
      } catch (e) {
        return; // silent by design — the world simply stays unscored
      }
      this.cache.set(arch, buf); // even a superseded load keeps its decode
      const keys = Array.from(this.cache.keys());
      for (let i = 0; this.cache.size > CACHE_MAX && i < keys.length; i++) {
        if (keys[i] !== arch) this.cache.delete(keys[i]);
      }
      if (token !== this.seq) return; // superseded while loading
    }
    if (token !== this.seq) return;
    this._fadeOut(this.current);
    this.current = this._start(arch, buf, entry.level);
  }

  stop() {
    this.seq++;
    this._fadeOut(this.current);
    this.current = null;
  }

  /* ------------------------------ internals ------------------------------ */

  // schedule the piece on repeat: each pass fades in over the seam as the
  // previous fades out. One future pass is always pre-scheduled, and the
  // chain advances on the audio clock itself (a finished source's onended),
  // so background-tab timer throttling can never misalign a join.
  _start(arch: string, buf: AudioBuffer, level: number): TrackHandle {
    const ctx = this.engine.ctx!;
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(this.engine.musicBus!);
    gain.gain.setTargetAtTime(level, ctx.currentTime + 0.05, 0.9); // world-entry fade to the by-ear trim
    const handle: TrackHandle = { arch: arch, gain: gain, sources: [] };
    const seam = Math.min(SEAM_MAX_S, Math.max(0.5, buf.duration / 8));
    const cycle = Math.max(1, buf.duration - seam);
    const self = this;
    const pass = (t0: number, first: boolean) => {
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const g = ctx.createGain();
      src.connect(g);
      g.connect(gain);
      if (first) g.gain.setValueAtTime(1, t0);
      else g.gain.setValueCurveAtTime(RISE, t0, seam);
      g.gain.setValueCurveAtTime(FALL, t0 + cycle, seam);
      src.start(t0);
      src.stop(t0 + cycle + seam + 0.1);
      handle.sources.push(src);
      if (handle.sources.length > 3) handle.sources.splice(0, handle.sources.length - 3);
      return src;
    };
    let nextT = ctx.currentTime + 0.06;
    const arm = (src: AudioBufferSourceNode) => {
      src.onended = () => {
        if (self.current !== handle) return; // the world has moved on
        nextT += cycle;
        arm(pass(nextT, false));
      };
    };
    arm(pass(nextT, true));
    nextT += cycle;
    arm(pass(nextT, false)); // the pass after this one is already in flight
    return handle;
  }

  _fadeOut(h: TrackHandle | null) {
    if (!h || !this.engine.ctx) return;
    const t = this.engine.ctx.currentTime;
    try {
      h.gain.gain.cancelScheduledValues(t);
      h.gain.gain.setTargetAtTime(0, t, 0.5);
    } catch (e) {}
    setTimeout(() => {
      h.sources.forEach((s) => {
        s.onended = null; // stopping must not chain another pass
        try {
          s.stop();
        } catch (e) {}
      });
      try {
        h.gain.disconnect();
      } catch (e) {}
    }, 1800);
  }
}

export const MUSIC = new MusicPlayer(AUDIO);
