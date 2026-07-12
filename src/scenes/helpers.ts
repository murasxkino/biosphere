/* Shared canvas painters for the living scenes. */

export function vgrad(ctx: CanvasRenderingContext2D, W: number, H: number, stops: Array<[number, string]>) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  for (let i = 0; i < stops.length; i++) g.addColorStop(stops[i][0], stops[i][1]);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

export function vignette(ctx: CanvasRenderingContext2D, W: number, H: number, a: number) {
  const g = ctx.createRadialGradient(
    W / 2,
    H * 0.42,
    Math.min(W, H) * 0.22,
    W / 2,
    H * 0.52,
    Math.max(W, H) * 0.85
  );
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

export function ridge(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  yBase: number,
  amp: number,
  seed: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-4, H + 4);
  ctx.lineTo(-4, yBase);
  for (let x = 0; x <= W + 14; x += 14) {
    const y =
      yBase +
      Math.sin(x * 0.012 + seed) * amp * 0.5 +
      Math.sin(x * 0.033 + seed * 2.7) * amp * 0.32 +
      Math.sin(x * 0.0053 + seed * 1.3) * amp * 0.7;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(W + 4, H + 4);
  ctx.closePath();
  ctx.fill();
}
