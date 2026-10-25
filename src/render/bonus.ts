// Neon bonus packages: each content has its own shape and colour, so the
// player can tell them apart at a glance (spec chapter 4). They pulse gently
// to stand out from the flies. The theme system in chapter 2.5 will take
// over the colours; the shapes stay.

import type { BonusKind, BonusPackage } from "../game/bonus";
import { ringPoint } from "../game/geometry";
import type { View } from "./view";

const COLORS: Record<BonusKind, string> = {
  points: "#ffc83d",
  slowdown: "#5ad1ff",
  life: "#ff5fa2",
};
const SIZE = 0.034;
const PULSE_PER_SECOND = 2.2;

export function drawBonusPackage(
  ctx: CanvasRenderingContext2D,
  view: View,
  pack: BonusPackage,
  ringCount: number,
  time: number,
): void {
  const p = ringPoint(pack.ring, ringCount, pack.angle);
  const pulse = 0.5 + 0.5 * Math.sin(time * PULSE_PER_SECOND * Math.PI * 2);
  const size = SIZE * view.unit * (1 + 0.08 * pulse);
  const color = COLORS[pack.kind];

  ctx.save();
  ctx.translate(view.cx + p.x * view.unit, view.cy + p.y * view.unit);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10 + 10 * pulse;
  ctx.lineWidth = Math.max(1.5, view.unit * 0.005);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  DRAW[pack.kind](ctx, size);
  ctx.restore();
}

const DRAW: Record<BonusKind, (ctx: CanvasRenderingContext2D, size: number) => void> = {
  /** A diamond with a four-pointed sparkle inside: treasure. */
  points(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(s, 0);
    ctx.lineTo(0, s);
    ctx.lineTo(-s, 0);
    ctx.closePath();
    ctx.stroke();
    const r = s * 0.5;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      const len = i % 2 === 0 ? r : r * 0.3;
      ctx.lineTo(Math.cos(a) * len, Math.sin(a) * len);
    }
    ctx.closePath();
    ctx.fill();
  },
  /** An hourglass in a rounded box: time slows down. */
  slowdown(ctx, s) {
    roundedSquare(ctx, s);
    ctx.stroke();
    const w = s * 0.5;
    const h = s * 0.62;
    ctx.beginPath();
    ctx.moveTo(-w, -h);
    ctx.lineTo(w, -h);
    ctx.lineTo(-w, h);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.stroke();
  },
  /** A heart: one more life. */
  life(ctx, s) {
    ctx.beginPath();
    ctx.moveTo(0, s * 0.85);
    ctx.bezierCurveTo(-s * 1.2, -s * 0.05, -s * 0.55, -s * 0.95, 0, -s * 0.38);
    ctx.bezierCurveTo(s * 0.55, -s * 0.95, s * 1.2, -s * 0.05, 0, s * 0.85);
    ctx.closePath();
    ctx.globalAlpha = 0.35;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.stroke();
  },
};

function roundedSquare(ctx: CanvasRenderingContext2D, s: number): void {
  const r = s * 0.3;
  ctx.beginPath();
  ctx.moveTo(-s + r, -s);
  ctx.arcTo(s, -s, s, s, r);
  ctx.arcTo(s, s, -s, s, r);
  ctx.arcTo(-s, s, -s, -s, r);
  ctx.arcTo(-s, -s, s, -s, r);
  ctx.closePath();
}
