import { GATE_SPOKES, SPOKE_COUNT } from "../game/config";
import { ringPoint, ringRadius, SPOKE_STEP } from "../game/geometry";
import type { View } from "./view";

const SEGMENTS_PER_RING = 240;

/** Draws the empty web: radial spokes, highlighted gate spokes and the rings. */
export function drawWeb(ctx: CanvasRenderingContext2D, view: View, ringCount: number): void {
  const { cx, cy, unit } = view;
  ctx.save();
  ctx.lineCap = "round";

  for (let spoke = 0; spoke < SPOKE_COUNT; spoke++) {
    const isGate = (GATE_SPOKES as readonly number[]).includes(spoke);
    const angle = spoke * SPOKE_STEP;
    const from = isGate ? ringRadius(0, ringCount) : 0.06;
    const to = isGate ? ringRadius(ringCount - 1, ringCount) : 1.02;
    ctx.strokeStyle = isGate ? "#ff6ad5" : "rgba(90, 220, 255, 0.3)";
    ctx.shadowColor = isGate ? "#ff6ad5" : "transparent";
    ctx.shadowBlur = isGate ? 10 : 0;
    ctx.lineWidth = isGate ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(angle) * from * unit, cy + Math.sin(angle) * from * unit);
    ctx.lineTo(cx + Math.cos(angle) * to * unit, cy + Math.sin(angle) * to * unit);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(120, 235, 255, 0.95)";
  ctx.shadowColor = "#4fe3ff";
  ctx.shadowBlur = 8;
  ctx.lineWidth = 1.6;
  for (let ring = 0; ring < ringCount; ring++) {
    ctx.beginPath();
    for (let i = 0; i <= SEGMENTS_PER_RING; i++) {
      const p = ringPoint(ring, ringCount, (i / SEGMENTS_PER_RING) * Math.PI * 2);
      const x = cx + p.x * unit;
      const y = cy + p.y * unit;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}
