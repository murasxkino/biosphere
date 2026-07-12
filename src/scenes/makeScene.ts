/* ========================================================================== */
/*  LIVING SCENES — layered generative canvas worlds, one per archetype      */
/*  Particle ceilings and budgets: docs/ART_DIRECTION.md.                     */
/* ========================================================================== */

import { vgrad, vignette, ridge } from "./helpers";

export interface Scene {
  resize?(W: number, H: number): void;
  draw(ctx: CanvasRenderingContext2D, W: number, H: number, t: number, dt: number): void;
}

export function makeScene(kind: string): Scene {
  const R = Math.random;
  const sin = Math.sin;
  const TAU = Math.PI * 2;

  /* ------------------------------- TUNDRA -------------------------------- */
  if (kind === "tundra") {
    let snow: any[] = [];
    return {
      resize(W, H) {
        snow = [];
        const layers = [
          [46, 0.9, 9],
          [32, 1.5, 16],
          [18, 2.4, 26],
        ];
        for (let li = 0; li < layers.length; li++) {
          const L = layers[li];
          for (let i = 0; i < L[0]; i++) {
            snow.push({
              x: R() * W,
              y: R() * H,
              r: L[1] * (0.7 + R() * 0.6),
              sp: L[2] * (0.7 + R() * 0.6),
              ph: R() * TAU,
              li: li,
            });
          }
        }
      },
      draw(ctx, W, H, t, dt) {
        vgrad(ctx, W, H, [
          [0, "#0a141d"],
          [0.55, "#123040"],
          [1, "#28505f"],
        ]);
        // aurora ribbons
        for (let k = 0; k < 2; k++) {
          const yB = H * (0.2 + k * 0.11);
          const col = k ? "rgba(140,190,255," : "rgba(120,255,205,";
          const pts: Array<[number, number]> = [];
          for (let x = 0; x <= W; x += 10) {
            pts.push([x, yB + sin(x * 0.004 + t * 0.1 + k * 2) * 26 + sin(x * 0.011 - t * 0.06 + k) * 12]);
          }
          ctx.beginPath();
          ctx.moveTo(pts[0][0], pts[0][1]);
          for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
          for (let i = pts.length - 1; i >= 0; i--)
            ctx.lineTo(pts[i][0], pts[i][1] + 46 + sin(i * 0.2 + t * 0.3) * 6);
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
          if (s.y > H + 4) {
            s.y = -4;
            s.x = R() * W;
          }
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
    let embers: any[] = [],
      wisps: any[] = [];
    return {
      resize(W, H) {
        embers = [];
        wisps = [];
        for (let i = 0; i < 56; i++)
          embers.push({ x: R() * W, y: R() * H, sp: 14 + R() * 26, ph: R() * TAU, rr: 0.8 + R() * 1.4 });
        for (let i = 0; i < 5; i++)
          wisps.push({
            x: R() * W,
            y: H * (0.45 + R() * 0.4),
            r: 60 + R() * 90,
            sp: 6 + R() * 8,
            ph: R() * TAU,
          });
      },
      draw(ctx, W, H, t, dt) {
        vgrad(ctx, W, H, [
          [0, "#080405"],
          [0.5, "#200a0c"],
          [1, "#3a130f"],
        ]);
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
          if (wp.y < -wp.r) {
            wp.y = H + wp.r;
            wp.x = R() * W;
          }
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
          if (e.y < -6) {
            e.y = H + 6;
            e.x = R() * W;
          }
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
    let clouds: any[] = [],
      birds: any[] = [],
      foam: any[] = [];
    return {
      resize(W, H) {
        clouds = [];
        birds = [];
        foam = [];
        for (let i = 0; i < 4; i++)
          clouds.push({ x: R() * W, y: H * (0.08 + R() * 0.28), w: 120 + R() * 140, sp: 4 + R() * 5 });
        for (let i = 0; i < 3; i++)
          birds.push({ x: R() * W, y: H * (0.14 + R() * 0.2), sp: 12 + R() * 10, ph: R() * TAU });
        for (let i = 0; i < 40; i++)
          foam.push({ x: R() * W, y: H * (0.6 + R() * 0.37), ph: R() * TAU, tw: 0.6 + R() * 1.6 });
      },
      draw(ctx, W, H, t, dt) {
        vgrad(ctx, W, H, [
          [0, "#182f3d"],
          [0.48, "#63929f"],
          [0.52, "#527f8c"],
          [1, "#0c2833"],
        ]);
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
          if (b.x > W + 12) {
            b.x = -12;
            b.y = H * (0.12 + R() * 0.22);
          }
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
            const y =
              yB + sin(x * 0.007 + t * (0.22 + j * 0.06) * dir + j * 2) * 7 + sin(x * 0.021 - t * 0.13) * 3;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(W + 4, H + 4);
          ctx.closePath();
          ctx.fillStyle = "rgba(190,225,232," + (0.045 + j * 0.02) + ")";
          ctx.fill();
          ctx.beginPath();
          for (let x = 0; x <= W + 12; x += 12) {
            const y =
              yB + sin(x * 0.007 + t * (0.22 + j * 0.06) * dir + j * 2) * 7 + sin(x * 0.021 - t * 0.13) * 3;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
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
    let motes: any[] = [],
      leaves: any[] = [],
      trunks: any[] = [];
    return {
      resize(W, H) {
        motes = [];
        leaves = [];
        trunks = [];
        for (let i = 0; i < 55; i++)
          motes.push({
            x: R() * W,
            y: R() * H,
            sp: 5 + R() * 9,
            ph: R() * TAU,
            r: 0.8 + R() * 1.4,
            tw: 0.5 + R() * 1.5,
          });
        for (let i = 0; i < 7; i++)
          leaves.push({ x: R() * W, y: R() * H, sp: 16 + R() * 14, ph: R() * TAU, rot: R() * TAU });
        trunks = [
          { x: W * 0.06, w: 15 },
          { x: W * 0.14, w: 8 },
          { x: W * 0.9, w: 13 },
          { x: W * 0.82, w: 7 },
        ];
      },
      draw(ctx, W, H, t, dt) {
        vgrad(ctx, W, H, [
          [0, "#08120b"],
          [0.5, "#173a23"],
          [1, "#0c2114"],
        ]);
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
        const cnr = [
          [0, 0],
          [W, 0],
        ];
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
          if (l.y > H + 8) {
            l.y = -8;
            l.x = R() * W;
          }
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
          if (m.y < -4) {
            m.y = H + 4;
            m.x = R() * W;
          }
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
    let stars: any[] = [],
      mist: any[] = [];
    return {
      resize(W, H) {
        stars = [];
        mist = [];
        for (let i = 0; i < 90; i++)
          stars.push({
            x: R() * W,
            y: R() * H * 0.52,
            r: 0.5 + R() * 0.9,
            tw: 0.3 + R() * 1.4,
            ph: R() * TAU,
          });
        for (let i = 0; i < 3; i++)
          mist.push({ y: H * (0.6 + i * 0.115), sp: 5 + i * 3, off: R() * W, r: 150 + R() * 80 });
      },
      draw(ctx, W, H, t, dt) {
        vgrad(ctx, W, H, [
          [0, "#161129"],
          [0.55, "#2e2354"],
          [1, "#5a3f78"],
        ]);
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
          const cx = (((ms.off % (W + 500)) + W + 500) % (W + 500)) - 250;
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
  let nStars: any[] = [],
    nClouds: any[] = [];
  const meteor = { active: false, next: 8 + R() * 14, x: 0, y: 0, vx: 0, vy: 0, life: 0 };
  return {
    resize(W, H) {
      nStars = [];
      nClouds = [];
      for (let i = 0; i < 140; i++)
        nStars.push({
          x: R() * W,
          y: R() * H * 0.72,
          r: 0.4 + R() * 1.0,
          tw: 0.15 + R() * 0.8,
          ph: R() * TAU,
          big: R() < 0.06,
        });
      for (let i = 0; i < 3; i++)
        nClouds.push({ x: R() * W, y: H * (0.16 + R() * 0.3), w: 180 + R() * 160, sp: 2.5 + R() * 2.5 });
    },
    draw(ctx, W, H, t, dt) {
      vgrad(ctx, W, H, [
        [0, "#06080e"],
        [0.6, "#0f141d"],
        [1, "#161d2a"],
      ]);
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
          ctx.moveTo(s.x - 4, s.y);
          ctx.lineTo(s.x + 4, s.y);
          ctx.moveTo(s.x, s.y - 4);
          ctx.lineTo(s.x, s.y + 4);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      // crescent moon
      const mx = W * 0.68,
        my = H * 0.17,
        mr = 19;
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
        const lg = ctx.createLinearGradient(
          meteor.x,
          meteor.y,
          meteor.x - meteor.vx * 0.14,
          meteor.y - meteor.vy * 0.14
        );
        lg.addColorStop(0, "rgba(235,240,250," + 0.8 * fade + ")");
        lg.addColorStop(1, "rgba(235,240,250,0)");
        ctx.strokeStyle = lg;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(meteor.x - meteor.vx * 0.14, meteor.y - meteor.vy * 0.14);
        ctx.stroke();
        if (meteor.life > 0.9) {
          meteor.active = false;
          meteor.next = t + 16 + R() * 26;
        }
      }
      ridge(ctx, W, H, H * 0.88, 22, 3.3, "#04060b");
      vignette(ctx, W, H, 0.38);
    },
  };
}
