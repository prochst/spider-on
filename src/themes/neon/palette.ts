// Colours of the Neon theme, from the style preview the user picked in
// phase 1: glowing cyan web, pink gate spokes, golden flies.

import type { BonusKind } from "../../game/bonus";
import type { SpiderRole } from "../theme";

export const BACKGROUND = "#07060f";
/** A faint violet haze behind the web gives the glow something to sit on. */
export const BACKGROUND_HAZE = "rgba(40, 30, 90, 0.55)";

export const RING = "rgba(120, 235, 255, 0.95)";
export const RING_GLOW = "#4fe3ff";
export const SPOKE = "rgba(90, 220, 255, 0.28)";
export const GATE = "rgba(255, 120, 220, 0.9)";
export const GATE_GLOW = "#ff6ad5";

export const FLY = "255, 205, 100";
export const FLY_GLOW = "#ffc857";

/** Outline and glow of each kind of spider; the body is filled with the background. */
export const SPIDER: Record<SpiderRole, { line: string; glow: string }> = {
  player: { line: "#e9fbff", glow: "#57e6ff" },
  enemy: { line: "#ff9be6", glow: "#ff3fb4" },
  // Slowed enemies take the violet of the slowdown package. Icy blue was too
  // close to the white and cyan player in play.
  slowedEnemy: { line: "#cfc6ff", glow: "#9d8cff" },
};

export const PACKAGE: Record<BonusKind, string> = {
  points: "#ffc83d",
  slowdown: "#9d8cff",
  life: "#ff5fa2",
};

export const CRASH_RING = "#ffffff";
/** Sparks alternate the colours of the two spiders that met. */
export const CRASH_SPARKS = ["#57e6ff", "#ff3fb4"] as const;

export const HUD = "#c9f6ff";
export const HUD_GLOW = "#57e6ff";

/** Touch controls: quiet cyan at rest, pink like the gate spokes while a thumb is on them. */
export const CONTROL = "#78ebff";
export const CONTROL_ACTIVE = "#ff6ad5";
export const CONTROL_GLOW = "#4fe3ff";
