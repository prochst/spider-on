// Points and extra lives (spec chapters 8 and 9).

import { EXTRA_LIFE_EVERY, EXTRA_LIFE_FIRST, MAX_LIVES } from "./config";

/** How many extra-life thresholds (5 000, 15 000, 25 000, …) a score has passed. */
function thresholdsReached(score: number): number {
  if (score < EXTRA_LIFE_FIRST) return 0;
  return 1 + Math.floor((score - EXTRA_LIFE_FIRST) / EXTRA_LIFE_EVERY);
}

export type ScoreState = { score: number; lives: number };

/** Adds points and any extra lives they earn, never above the maximum. */
export function addPoints(state: ScoreState, points: number): void {
  const before = thresholdsReached(state.score);
  state.score += points;
  const earned = thresholdsReached(state.score) - before;
  state.lives = Math.min(state.lives + earned, MAX_LIVES);
}
