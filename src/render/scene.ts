// Draws one frame from the game state through the current theme. This file
// decides what is on screen and where; the theme decides how it looks.

import type { BonusNoticeKind } from "../game/bonus";
import { BONUS_POINTS, CRASH_DURATION } from "../game/config";
import type { Field } from "../game/field";
import type { Game } from "../game/game";
import { ringPoint } from "../game/geometry";
import { type Spider, spiderPosition } from "../game/spider";
import type { SpiderRole, Theme } from "../themes/theme";
import { webLayout, toScreen } from "./layout";
import type { LegAnimator } from "./legs";
import type { View } from "./view";

/** Sizes in units of R, the same for every theme so the look matches the collisions. */
const FLY_SIZE = 0.012;
const PACKAGE_SIZE = 0.034;
const SPIDER_SIZE = 0.048;

// Screens where the web is visible; on the others the menu covers a dimmed web.
const WEB_SCREENS = new Set(["ready", "playing", "crash", "paused", "roundComplete", "gameOver"]);

// Each line fits inside the innermost ring.
const NOTICE_LINES: Record<BonusNoticeKind, readonly string[]> = {
  points: [`+${BONUS_POINTS} BODŮ`],
  slowdown: ["ZPOMALENÍ", "NEPŘÁTEL"],
  life: ["+1 ŽIVOT"],
  livesFull: ["ŽIVOTY", "JSOU PLNÉ"],
};
/** The message fades out during its last half second. */
const NOTICE_FADE_TIME = 0.5;

export type Renderer = {
  theme: Theme;
  legs: LegAnimator;
};

/** time is in seconds and only drives animations such as pulsing flies and packages. */
export function drawScene(ctx: CanvasRenderingContext2D, view: View, game: Game, renderer: Renderer, time: number): void {
  const { theme } = renderer;
  const { field } = game;
  theme.drawBackground(ctx, view);

  const inGame = WEB_SCREENS.has(game.screen.name);
  ctx.globalAlpha = inGame ? 1 : 0.35;
  theme.drawWeb(ctx, view, webLayout(view, field.ringCount));
  ctx.globalAlpha = 1;
  if (!inGame) return;

  field.flies.forEach((fly, index) => {
    if (fly.collected) return;
    const at = toScreen(view, ringPoint(fly.ring, field.ringCount, fly.angle));
    theme.drawFly(ctx, at, FLY_SIZE * view.unit, index, time);
  });
  const { package: pack, notice } = field.bonus;
  if (pack) {
    const at = toScreen(view, ringPoint(pack.ring, field.ringCount, pack.angle));
    theme.drawBonusPackage(ctx, at, PACKAGE_SIZE * view.unit, pack.kind, time);
  }
  if (notice) {
    const opacity = Math.min(1, notice.timeLeft / NOTICE_FADE_TIME);
    theme.drawBonusNotice(ctx, view, NOTICE_LINES[notice.kind], notice.kind, opacity);
  }

  const enemyRole: SpiderRole = field.bonus.slowdownLeft > 0 ? "slowedEnemy" : "enemy";
  for (const enemy of field.enemies) drawSpider(ctx, view, field, enemy, enemyRole, renderer);
  if (game.screen.name === "crash") {
    const at = toScreen(view, spiderPosition(field.player, field.ringCount));
    theme.drawCrash(ctx, at, SPIDER_SIZE * view.unit, 1 - game.screen.timeLeft / CRASH_DURATION);
  } else {
    drawSpider(ctx, view, field, field.player, "player", renderer);
  }

  const { score, round, lives } = game.session;
  theme.drawHud(ctx, view, { score, round, lives });
}

function drawSpider(
  ctx: CanvasRenderingContext2D,
  view: View,
  field: Field,
  spider: Spider,
  role: SpiderRole,
  { theme, legs }: Renderer,
): void {
  const at = toScreen(view, spiderPosition(spider, field.ringCount));
  const size = SPIDER_SIZE * view.unit;
  theme.drawSpider(ctx, { at, heading: heading(spider), size, legPhase: legs.phase(spider, at, size), role });
}

/** Tangent to the ring in the direction of travel; during a climb, along the spoke. */
function heading(spider: Spider): number {
  if (spider.crossing) return spider.angle + (spider.crossing.to > spider.crossing.from ? 0 : Math.PI);
  return spider.angle + (spider.direction * Math.PI) / 2;
}
