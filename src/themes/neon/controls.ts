// Touch controls of the Neon theme: a rounded square with four arrows for the
// touchpad and a round button with a double chevron for the throttle. Both light up while
// a thumb is on them; the pad flashes an arrow for each recognised swipe.

import type { TouchControls } from "../theme";
import { CONTROL, CONTROL_ACTIVE, CONTROL_GLOW } from "./palette";

const IDLE_ALPHA = 0.45;

export function drawTouchControls(ctx: CanvasRenderingContext2D, controls: TouchControls): void {
  const { pad, throttle, swipe } = controls;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.shadowColor = CONTROL_GLOW;

  setStyle(ctx, pad.held, pad.half);
  const side = pad.half * 2;
  ctx.beginPath();
  ctx.roundRect(pad.x - pad.half, pad.y - pad.half, side, side, pad.half * 0.18);
  ctx.stroke();
  drawPadArrows(ctx, pad.x, pad.y, pad.half);

  if (swipe) drawSwipeArrow(ctx, pad.x, pad.y, pad.half, swipe);

  setStyle(ctx, throttle.held, throttle.r);
  if (throttle.held) {
    ctx.fillStyle = CONTROL_ACTIVE;
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.arc(throttle.x, throttle.y, throttle.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
  ctx.beginPath();
  ctx.arc(throttle.x, throttle.y, throttle.r, 0, Math.PI * 2);
  ctx.stroke();
  // Double chevron: faster.
  const s = throttle.r * 0.28;
  ctx.beginPath();
  for (const offset of [-s * 0.6, s * 0.6]) {
    ctx.moveTo(throttle.x + offset - s * 0.5, throttle.y - s);
    ctx.lineTo(throttle.x + offset + s * 0.5, throttle.y);
    ctx.lineTo(throttle.x + offset - s * 0.5, throttle.y + s);
  }
  ctx.stroke();
  ctx.restore();
}

function setStyle(ctx: CanvasRenderingContext2D, held: boolean, r: number): void {
  ctx.strokeStyle = held ? CONTROL_ACTIVE : CONTROL;
  ctx.globalAlpha = held ? 1 : IDLE_ALPHA;
  ctx.shadowBlur = held ? 16 : 6;
  ctx.lineWidth = Math.max(1.5, r * 0.05);
}

/** The four directions of the gate spokes, the only ones a swipe can mean. */
const PAD_DIRECTIONS = [0, Math.PI / 2, Math.PI, -Math.PI / 2];

function drawPadArrows(ctx: CanvasRenderingContext2D, x: number, y: number, half: number): void {
  const tip = half * 0.78;
  const depth = half * 0.2;
  const width = half * 0.22;
  ctx.save();
  ctx.globalAlpha *= 0.7;
  ctx.beginPath();
  for (const angle of PAD_DIRECTIONS) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const baseX = x + cos * (tip - depth);
    const baseY = y + sin * (tip - depth);
    ctx.moveTo(baseX - sin * width, baseY + cos * width);
    ctx.lineTo(x + cos * tip, y + sin * tip);
    ctx.lineTo(baseX + sin * width, baseY - cos * width);
  }
  ctx.stroke();
  ctx.restore();
}

function drawSwipeArrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  swipe: NonNullable<TouchControls["swipe"]>,
): void {
  const tipX = x + swipe.dx * r * 0.7;
  const tipY = y + swipe.dy * r * 0.7;
  const head = r * 0.25;
  const angle = Math.atan2(swipe.dy, swipe.dx);
  ctx.save();
  ctx.globalAlpha = swipe.opacity;
  ctx.strokeStyle = CONTROL_ACTIVE;
  ctx.shadowBlur = 14;
  ctx.lineWidth = Math.max(2, r * 0.08);
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(tipX, tipY);
  ctx.moveTo(tipX + Math.cos(angle + 2.5) * head, tipY + Math.sin(angle + 2.5) * head);
  ctx.lineTo(tipX, tipY);
  ctx.lineTo(tipX + Math.cos(angle - 2.5) * head, tipY + Math.sin(angle - 2.5) * head);
  ctx.stroke();
  ctx.restore();
}
