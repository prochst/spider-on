// Texts and effects of the Neon theme: the HUD, the message about an eaten
// package and the crash burst.

import type { BonusNoticeKind } from "../../game/bonus";
import type { View } from "../../render/view";
import type { HudInfo, Px } from "../theme";
import { CRASH_RING, CRASH_SPARKS, HUD, HUD_GLOW, PACKAGE } from "./palette";

export const FONT_FAMILY = '"Chakra Petch", system-ui, sans-serif';

const SCORE_DIGITS = 5;
const NOTICE_COLORS: Record<BonusNoticeKind, string> = { ...PACKAGE, livesFull: PACKAGE.life };
const CRASH_SPARK_COUNT = 12;

export function drawHud(ctx: CanvasRenderingContext2D, view: View, hud: HudInfo): void {
  const size = Math.max(14, Math.round(view.unit * 0.07));
  const margin = size;
  ctx.save();
  ctx.fillStyle = HUD;
  ctx.shadowColor = HUD_GLOW;
  ctx.shadowBlur = 8;
  ctx.font = `700 ${size}px ${FONT_FAMILY}`;
  ctx.textBaseline = "top";

  ctx.textAlign = "left";
  ctx.fillText(`SKÓRE ${String(hud.score).padStart(SCORE_DIGITS, "0")}`, margin, margin);
  ctx.fillText(`KOLO ${hud.round}`, margin, margin + size * 1.4);

  // Leaves room in the top right corner for the pause button.
  ctx.textAlign = "right";
  ctx.fillText(`ŽIVOTY ${hud.lives}`, view.width - margin * 4, margin);
  ctx.restore();
}

export function drawBonusNotice(
  ctx: CanvasRenderingContext2D,
  view: View,
  lines: readonly string[],
  kind: BonusNoticeKind,
  opacity: number,
): void {
  const color = NOTICE_COLORS[kind];
  const size = Math.round(view.unit * 0.065);
  const lineHeight = size * 1.15;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 14;
  ctx.font = `700 ${size}px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const top = view.cy - ((lines.length - 1) * lineHeight) / 2;
  lines.forEach((line, i) => ctx.fillText(line, view.cx, top + i * lineHeight));
  ctx.restore();
}

/** A white ring and a burst of sparks flying out and fading. */
export function drawCrash(ctx: CanvasRenderingContext2D, at: Px, size: number, progress: number): void {
  const fade = 1 - progress;
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.shadowColor = CRASH_RING;
  ctx.shadowBlur = 18;
  ctx.strokeStyle = CRASH_RING;
  ctx.lineWidth = Math.max(1.5, size * 0.15);
  ctx.beginPath();
  ctx.arc(at.x, at.y, size * (0.8 + 5 * progress), 0, Math.PI * 2);
  ctx.stroke();

  const reach = size * (0.6 + 4 * progress);
  for (let i = 0; i < CRASH_SPARK_COUNT; i++) {
    const angle = (i / CRASH_SPARK_COUNT) * Math.PI * 2;
    const color = CRASH_SPARKS[i % CRASH_SPARKS.length] ?? CRASH_RING;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.beginPath();
    ctx.arc(at.x + Math.cos(angle) * reach, at.y + Math.sin(angle) * reach, size * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
