// Draws one frame from the game state. Colours are placeholders until the
// theme system arrives in chapter 2.5.

import { CRASH_DURATION } from "../game/config";
import type { Game } from "../game/game";
import type { View } from "./view";
import { drawSpiders } from "./spiders";
import { drawWeb } from "./web";

const BACKGROUND = "#07060f";
const HUD_COLOR = "#c9f6ff";
const CRASH_COLOR = "#ff4f6d";

// Screens where the web is visible; on the others the menu covers a dimmed web.
const WEB_SCREENS = new Set(["ready", "playing", "crash", "paused", "roundComplete", "gameOver"]);

export function drawScene(ctx: CanvasRenderingContext2D, view: View, game: Game): void {
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, view.width, view.height);

  const inGame = WEB_SCREENS.has(game.screen.name);
  ctx.globalAlpha = inGame ? 1 : 0.35;
  drawWeb(ctx, view, game.field.ringCount);
  ctx.globalAlpha = 1;
  if (inGame) drawSpiders(ctx, view, game.field);

  if (game.screen.name === "crash") drawCrash(ctx, view, 1 - game.screen.timeLeft / CRASH_DURATION);
  if (inGame) drawHud(ctx, view, game);
}

/** An expanding ring from the centre; the real crash effect comes with the spiders. */
function drawCrash(ctx: CanvasRenderingContext2D, view: View, progress: number): void {
  ctx.save();
  ctx.strokeStyle = CRASH_COLOR;
  ctx.shadowColor = CRASH_COLOR;
  ctx.shadowBlur = 16;
  ctx.globalAlpha = 1 - progress;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(view.cx, view.cy, view.unit * (0.1 + progress), 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawHud(ctx: CanvasRenderingContext2D, view: View, game: Game): void {
  const { session } = game;
  const size = Math.max(12, Math.round(view.unit * 0.06));
  const margin = size;
  ctx.save();
  ctx.fillStyle = HUD_COLOR;
  ctx.shadowColor = "#4fe3ff";
  ctx.shadowBlur = 8;
  ctx.font = `600 ${size}px system-ui, sans-serif`;
  ctx.textBaseline = "top";

  ctx.textAlign = "left";
  ctx.fillText(`SKÓRE ${session.score}`, margin, margin);
  ctx.fillText(`KOLO ${session.round}`, margin, margin + size * 1.4);

  // Leaves room in the top right corner for the pause button.
  ctx.textAlign = "right";
  ctx.fillText(`ŽIVOTY ${session.lives}`, view.width - margin * 4, margin);
  ctx.restore();
}
