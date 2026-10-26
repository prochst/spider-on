// The common interface of all look-and-feel themes (spec chapter 14). The
// renderer works out where everything is in canvas pixels; a theme only
// decides how it looks. A theme never sees the game state, so the logic knows
// nothing about themes and a new theme cannot break the rules.

import type { BonusKind, BonusNoticeKind } from "../game/bonus";
import type { View } from "../render/view";

/** A point in canvas pixels (CSS pixels, before the HiDPI scale). */
export type Px = { x: number; y: number };

/** The empty web in canvas pixels. */
export type WebLayout = {
  /** Each ring as a closed polyline, from the innermost ring out. */
  rings: Px[][];
  spokes: { from: Px; to: Px; isGate: boolean }[];
};

export type SpiderRole = "player" | "enemy" | "slowedEnemy";

export type SpiderPose = {
  at: Px;
  /** Direction of travel in radians, 0 pointing right, growing clockwise. */
  heading: number;
  /** Body size in pixels; the collision distance is about one and a half of it. */
  size: number;
  /** Grows with the distance crawled, so the legs move only while the spider moves. */
  legPhase: number;
  role: SpiderRole;
};

export type HudInfo = { score: number; round: number; lives: number };

export type Theme = {
  /** Stable id, kept in the settings once themes can be chosen (chapter 2.7). */
  id: string;
  /** Name shown in the settings. */
  name: string;
  /** CSS font family for the canvas texts and the menus. */
  fontFamily: string;
  /** Colours of the menus over the canvas, as CSS values. */
  menu: { text: string; panel: string; border: string; accent: string; glow: string };

  drawBackground(ctx: CanvasRenderingContext2D, view: View): void;
  drawWeb(ctx: CanvasRenderingContext2D, view: View, web: WebLayout): void;
  /** index tells flies apart, so each can animate a little differently. */
  drawFly(ctx: CanvasRenderingContext2D, at: Px, size: number, index: number, time: number): void;
  drawBonusPackage(ctx: CanvasRenderingContext2D, at: Px, size: number, kind: BonusKind, time: number): void;
  /** lines are the message in the player's language; opacity fades it out at the end. */
  drawBonusNotice(
    ctx: CanvasRenderingContext2D,
    view: View,
    lines: readonly string[],
    kind: BonusNoticeKind,
    opacity: number,
  ): void;
  drawSpider(ctx: CanvasRenderingContext2D, pose: SpiderPose): void;
  /** progress runs from 0 to 1 during the crash animation. */
  drawCrash(ctx: CanvasRenderingContext2D, at: Px, size: number, progress: number): void;
  drawHud(ctx: CanvasRenderingContext2D, view: View, hud: HudInfo): void;
};
