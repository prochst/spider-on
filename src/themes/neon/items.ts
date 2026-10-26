// Flies and bonus packages of the Neon theme. Flies glow like fireflies;
// each package content has its own shape and colour, so the player tells
// them apart at a glance (spec chapter 4), and packages pulse to stand out.

import type { BonusKind } from "../../game/bonus";
import type { Px } from "../theme";
import { FLY, FLY_GLOW, PACKAGE } from "./palette";

const FLY_PULSE_PER_SECOND = 0.5;
const PACKAGE_PULSE_PER_SECOND = 2.2;

export function drawFly(ctx: CanvasRenderingContext2D, at: Px, size: number, index: number, time: number): void {
  // Each fly pulses in its own rhythm, so the web twinkles instead of blinking as one.
  const pulse = 0.75 + 0.25 * Math.sin(time * FLY_PULSE_PER_SECOND * Math.PI * 2 + index * 2.4);
  ctx.save();
  ctx.translate(at.x, at.y);
  ctx.shadowColor = FLY_GLOW;
  ctx.shadowBlur = 12 * pulse;
  ctx.fillStyle = `rgba(${FLY}, ${0.35 * pulse})`;
  ctx.beginPath();
  ctx.ellipse(-size * 0.9, -size * 0.8, size * 0.85, size * 0.45, -0.6, 0, Math.PI * 2);
  ctx.ellipse(size * 0.9, -size * 0.8, size * 0.85, size * 0.45, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = `rgba(${FLY}, ${pulse})`;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawBonusPackage(ctx: CanvasRenderingContext2D, at: Px, size: number, kind: BonusKind, time: number): void {
  const pulse = 0.5 + 0.5 * Math.sin(time * PACKAGE_PULSE_PER_SECOND * Math.PI * 2);
  const s = size * (1 + 0.08 * pulse);
  const color = PACKAGE[kind];
  ctx.save();
  ctx.translate(at.x, at.y);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 10 + 10 * pulse;
  ctx.lineWidth = Math.max(1.5, size * 0.16);
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  DRAW[kind](ctx, s);
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
