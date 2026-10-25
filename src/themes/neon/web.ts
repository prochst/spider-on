import type { View } from "../../render/view";
import type { WebLayout } from "../theme";
import { BACKGROUND, BACKGROUND_HAZE, GATE, GATE_GLOW, RING, RING_GLOW, SPOKE } from "./palette";

export function drawBackground(ctx: CanvasRenderingContext2D, view: View): void {
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, view.width, view.height);
  const haze = ctx.createRadialGradient(view.cx, view.cy, 0, view.cx, view.cy, view.unit * 1.1);
  haze.addColorStop(0, BACKGROUND_HAZE);
  haze.addColorStop(1, "rgba(7, 6, 15, 0)");
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, view.width, view.height);
}

/** Thin plain spokes, glowing pink gate spokes on top, then the cyan rings. */
export function drawWeb(ctx: CanvasRenderingContext2D, view: View, web: WebLayout): void {
  const line = Math.max(1, view.unit * 0.006);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const spoke of web.spokes) {
    ctx.strokeStyle = spoke.isGate ? GATE : SPOKE;
    ctx.lineWidth = spoke.isGate ? line * 1.25 : line * 0.6;
    ctx.shadowColor = spoke.isGate ? GATE_GLOW : "transparent";
    ctx.shadowBlur = spoke.isGate ? 10 : 0;
    ctx.beginPath();
    ctx.moveTo(spoke.from.x, spoke.from.y);
    ctx.lineTo(spoke.to.x, spoke.to.y);
    ctx.stroke();
  }

  ctx.strokeStyle = RING;
  ctx.shadowColor = RING_GLOW;
  ctx.shadowBlur = 8;
  ctx.lineWidth = line;
  for (const ring of web.rings) {
    ctx.beginPath();
    ring.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
    ctx.stroke();
  }
  ctx.restore();
}
