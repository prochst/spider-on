// Placeholder spiders: a glowing body with eight legs, facing the direction
// of travel. The real neon look and the theme system come in chapter 2.5.

import type { Field } from "../game/field";
import { type Spider, spiderPosition } from "../game/spider";
import type { View } from "./view";

const PLAYER_COLOR = "#9dff6a";
const ENEMY_COLOR = "#ff4f6d";
const BODY_RADIUS = 0.03;
const LEG_LENGTH = 0.045;

export function drawSpiders(ctx: CanvasRenderingContext2D, view: View, field: Field): void {
  for (const enemy of field.enemies) drawSpider(ctx, view, enemy, field.ringCount, ENEMY_COLOR);
  drawSpider(ctx, view, field.player, field.ringCount, PLAYER_COLOR);
}

function drawSpider(ctx: CanvasRenderingContext2D, view: View, spider: Spider, ringCount: number, color: string): void {
  const p = spiderPosition(spider, ringCount);
  const x = view.cx + p.x * view.unit;
  const y = view.cy + p.y * view.unit;
  // Tangent to the ring in the direction of travel; on a spoke, along the spoke.
  const heading = spider.crossing
    ? spider.angle + (spider.crossing.to > spider.crossing.from ? 0 : Math.PI)
    : spider.angle + (spider.direction * Math.PI) / 2;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(heading);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.shadowColor = color;
  ctx.shadowBlur = 12;
  ctx.lineWidth = Math.max(1, view.unit * 0.006);
  ctx.lineCap = "round";

  const body = BODY_RADIUS * view.unit;
  const leg = LEG_LENGTH * view.unit;
  ctx.beginPath();
  for (const side of [-1, 1]) {
    for (const along of [-0.6, -0.2, 0.2, 0.6]) {
      ctx.moveTo(along * body, side * body * 0.5);
      ctx.lineTo(along * body + along * leg * 0.6, side * (body * 0.5 + leg));
    }
  }
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(0, 0, body, body * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();
  // A head marks which way the spider faces.
  ctx.beginPath();
  ctx.arc(body * 1.1, 0, body * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
