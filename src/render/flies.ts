// Placeholder flies: a small glowing body with two wings. The neon look comes
// with the theme system in chapter 2.5.

import type { Fly } from "../game/flies";
import { ringPoint } from "../game/geometry";
import type { View } from "./view";

const FLY_COLOR = "#ffe66a";
const FLY_SIZE = 0.012;

export function drawFlies(ctx: CanvasRenderingContext2D, view: View, flies: readonly Fly[], ringCount: number): void {
  const size = FLY_SIZE * view.unit;
  ctx.save();
  ctx.fillStyle = FLY_COLOR;
  ctx.shadowColor = FLY_COLOR;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  for (const fly of flies) {
    if (fly.collected) continue;
    const p = ringPoint(fly.ring, ringCount, fly.angle);
    const x = view.cx + p.x * view.unit;
    const y = view.cy + p.y * view.unit;
    ctx.moveTo(x + size, y);
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.moveTo(x, y);
    ctx.ellipse(x - size, y - size, size * 0.9, size * 0.5, -0.6, 0, Math.PI * 2);
    ctx.moveTo(x, y);
    ctx.ellipse(x + size, y - size, size * 0.9, size * 0.5, 0.6, 0, Math.PI * 2);
  }
  ctx.globalAlpha = 0.9;
  ctx.fill();
  ctx.restore();
}
