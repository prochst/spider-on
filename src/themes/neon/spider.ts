// A neon spider: glowing outline legs that swing as it crawls, a body filled
// with the background colour so the web does not show through, and two
// bright eyes at the front.

import type { SpiderPose } from "../theme";
import { BACKGROUND, SPIDER } from "./palette";

/** Angle of each leg pair from the side, front pair first. */
const LEG_ANGLES = [0.95, 0.4, -0.2, -0.75];
const LEG_SWING = 0.22;

export function drawSpider(ctx: CanvasRenderingContext2D, pose: SpiderPose): void {
  const { size } = pose;
  const colors = SPIDER[pose.role];
  ctx.save();
  ctx.translate(pose.at.x, pose.at.y);
  ctx.rotate(pose.heading);
  ctx.strokeStyle = colors.line;
  ctx.shadowColor = colors.glow;
  ctx.shadowBlur = 12;
  ctx.lineWidth = Math.max(1.2, size * 0.11);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const side of [1, -1]) {
    LEG_ANGLES.forEach((angle, i) => drawLeg(ctx, size, side, i, angle, pose.legPhase));
  }

  ctx.fillStyle = BACKGROUND;
  ctx.beginPath();
  ctx.ellipse(-size * 0.75, 0, size * 0.8, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(size * 0.25, 0, size * 0.42, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = colors.line;
  ctx.beginPath();
  ctx.arc(size * 0.5, -size * 0.14, size * 0.08, 0, Math.PI * 2);
  ctx.arc(size * 0.5, size * 0.14, size * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** One leg from the body through the knee to the foot. Neighbouring legs swing in opposite phase, like a real gait. */
function drawLeg(ctx: CanvasRenderingContext2D, size: number, side: number, i: number, angle: number, phase: number): void {
  const swing = LEG_SWING * Math.sin(phase + (i * Math.PI) / 2 + (side > 0 ? 0 : Math.PI));
  const baseX = size * (0.35 - i * 0.18);
  const baseY = side * size * 0.18;
  const upper = side * (Math.PI / 2 - angle) + swing * side;
  const kneeX = baseX + Math.cos(upper) * size;
  const kneeY = baseY + Math.sin(upper) * size;
  const lower = upper + side * (i < 2 ? -0.55 : 0.55);
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(kneeX, kneeY);
  ctx.lineTo(kneeX + Math.cos(lower) * size * 1.05, kneeY + Math.sin(lower) * size * 1.05);
  ctx.stroke();
}
