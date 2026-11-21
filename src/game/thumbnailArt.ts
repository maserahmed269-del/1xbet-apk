function setupCanvas(canvas: HTMLCanvasElement): { ctx: CanvasRenderingContext2D; w: number; h: number } | null {
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(rect.width || canvas.clientWidth || 320, 120);
  const h = Math.max(rect.height || canvas.clientHeight || 150, 90);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

export function drawCrashThumb(canvas: HTMLCanvasElement): void {
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, w, h } = setup;

  // Deep violet to dark crimson sky matching original Crash artwork
  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#12132e');
  bg.addColorStop(0.55, '#2b133a');
  bg.addColorStop(1, '#3b1128');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Subtle magenta glow behind jet
  const glow = ctx.createRadialGradient(w * 0.65, h * 0.35, 10, w * 0.65, h * 0.35, 130);
  glow.addColorStop(0, 'rgba(239, 68, 68, 0.32)');
  glow.addColorStop(1, 'rgba(239, 68, 68, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Stars
  const stars = [
    [0.1, 0.16], [0.22, 0.34], [0.35, 0.14], [0.54, 0.22], [0.82, 0.14], [0.16, 0.6], [0.9, 0.45],
  ];
  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  for (const [sx, sy] of stars) {
    ctx.beginPath();
    ctx.arc(sx * w, sy * h, 1.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Sweeping golden trajectory trail
  const startX = w * 0.16;
  const startY = h * 0.86;
  const tipX = w * 0.72;
  const tipY = h * 0.31;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(w * 0.45, h * 0.68, tipX, tipY);
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Floating gold coins along trajectory
  const coins = [
    [w * 0.34, h * 0.76, 9],
    [w * 0.48, h * 0.64, 11],
    [w * 0.61, h * 0.49, 10],
  ];
  for (const [cx, cy, r] of coins) {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#fde047';
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // Commercial red & white airliner jet
  ctx.save();
  ctx.translate(tipX + 6, tipY - 4);
  ctx.rotate(-0.42);

  // Flame
  ctx.beginPath();
  ctx.moveTo(-26, 1);
  ctx.lineTo(-46, 0);
  ctx.lineTo(-26, 7);
  ctx.closePath();
  ctx.fillStyle = '#fb923c';
  ctx.fill();

  // Tail fin
  ctx.beginPath();
  ctx.moveTo(-24, -2);
  ctx.lineTo(-32, -16);
  ctx.lineTo(-16, -16);
  ctx.lineTo(-10, -2);
  ctx.closePath();
  ctx.fillStyle = '#dc2626';
  ctx.fill();

  // White fuselage
  ctx.beginPath();
  ctx.ellipse(2, 0, 28, 7.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();

  // Red belly accent
  ctx.beginPath();
  ctx.ellipse(0, 3.2, 24, 3.8, 0, 0, Math.PI);
  ctx.fillStyle = '#ef4444';
  ctx.fill();

  // Swept wing
  ctx.beginPath();
  ctx.moveTo(4, 2);
  ctx.lineTo(-14, 15);
  ctx.lineTo(-20, 13);
  ctx.lineTo(-8, 2);
  ctx.closePath();
  ctx.fillStyle = '#e2e8f0';
  ctx.fill();

  // Cockpit glass
  ctx.beginPath();
  ctx.ellipse(19, -2, 5, 2.5, 0.25, 0, Math.PI * 2);
  ctx.fillStyle = '#38bdf8';
  ctx.fill();

  ctx.restore();
}

export function drawAppleThumb(canvas: HTMLCanvasElement): void {
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, w, h } = setup;

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#092e20');
  bg.addColorStop(1, '#10492e');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const glow = ctx.createRadialGradient(w * 0.5, h * 0.42, 6, w * 0.5, h * 0.42, 62);
  glow.addColorStop(0, 'rgba(74, 222, 128, 0.28)');
  glow.addColorStop(1, 'rgba(74, 222, 128, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.43;
  ctx.beginPath();
  ctx.arc(cx - 10, cy, 20, 0, Math.PI * 2);
  ctx.arc(cx + 10, cy, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx - 14, cy - 8, 5, 9, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(cx + 8, cy - 22, 10, 5, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = '#4ade80';
  ctx.fill();

  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, cy - 16);
  ctx.quadraticCurveTo(cx + 2, cy - 27, cx + 6, cy - 29);
  ctx.stroke();
}

export function drawDiceThumb(canvas: HTMLCanvasElement): void {
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, w, h } = setup;

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#361326');
  bg.addColorStop(1, '#581629');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const drawDie = (
    x: number,
    y: number,
    angle: number,
    bgColor: string,
    pipColor: string,
    pips: Array<[number, number]>
  ) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(-19, -19, 38, 38, 8);
    ctx.fill();

    ctx.fillStyle = pipColor;
    for (const [px, py] of pips) {
      ctx.beginPath();
      ctx.arc(px * 9.5, py * 9.5, 3.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  drawDie(w * 0.36, h * 0.44, -0.22, '#f8fafc', '#dc2626', [[-1, -1], [1, -1], [-1, 1], [1, 1]]);
  drawDie(w * 0.64, h * 0.4, 0.18, '#dc2626', '#ffffff', [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]]);
}

export function drawCrystalThumb(canvas: HTMLCanvasElement): void {
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, w, h } = setup;

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#181842');
  bg.addColorStop(1, '#312363');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const cx = w * 0.5;
  const cy = h * 0.42;

  // Bright cyan-blue diamond matching screenshot
  ctx.beginPath();
  ctx.moveTo(cx, cy - 28);
  ctx.lineTo(cx + 24, cy - 4);
  ctx.lineTo(cx, cy + 26);
  ctx.lineTo(cx - 24, cy - 4);
  ctx.closePath();
  ctx.fillStyle = '#0ea5e9';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx, cy - 28);
  ctx.lineTo(cx + 11, cy - 4);
  ctx.lineTo(cx, cy + 26);
  ctx.lineTo(cx - 11, cy - 4);
  ctx.closePath();
  ctx.fillStyle = '#7dd3fc';
  ctx.fill();
}

export function drawSwampThumb(canvas: HTMLCanvasElement): void {
  const setup = setupCanvas(canvas);
  if (!setup) return;
  const { ctx, w, h } = setup;

  const bg = ctx.createLinearGradient(0, 0, w, h);
  bg.addColorStop(0, '#072c2a');
  bg.addColorStop(1, '#0d4f49');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // Swamp pad / wooden raft matching screenshot
  ctx.fillStyle = '#14b8a6';
  ctx.beginPath();
  ctx.roundRect(w * 0.25, h * 0.3, w * 0.5, 34, 8);
  ctx.fill();

  ctx.fillStyle = '#d97706';
  ctx.beginPath();
  ctx.roundRect(w * 0.3, h * 0.34, w * 0.4, 24, 5);
  ctx.fill();

  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.roundRect(w * 0.35, h * 0.38, w * 0.3, 14, 3);
  ctx.fill();
}
