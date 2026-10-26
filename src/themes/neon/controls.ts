// Touch controls of the Neon theme: a ring with a cross for the touchpad and
// a round button with a double chevron for the throttle. Both light up while
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

  setStyle(ctx, pad.held, pad.r);
  ctx.beginPath();
  ctx.arc(pad.x, pad.y, pad.r, 0, Math.PI * 2);
  ctx.stroke();
  // A cross shows the four directions of the gate spokes.
  const arm = pad.r * 0.35;
  ctx.beginPath();
  ctx.moveTo(pad.x - arm, pad.y);
  ctx.lineTo(pad.x + arm, pad.y);
  ctx.moveTo(pad.x, pad.y - arm);
  ctx.lineTo(pad.x, pad.y + arm);
  ctx.globalAlpha *= 0.5;
  ctx.stroke();

  if (swipe) drawSwipeArrow(ctx, pad.x, pad.y, pad.r, swipe);

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
