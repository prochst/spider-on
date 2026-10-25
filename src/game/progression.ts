// How the game gets harder (spec chapter 6): the round number decides the
// size of the web and the difficulty level, the level decides the enemies.

import {
  ENEMY_FAST_FACTOR,
  ENEMY_MAX_FACTOR,
  ENEMY_SLOW_FACTOR,
  ENEMY_SPEEDUP_PER_LEVEL,
  MAX_RING_COUNT,
  MIN_RING_COUNT,
} from "./config";
import type { EnemySetup } from "./field";

// Rounds 1–3 are on 3 rings, 4–9 on 4 rings, 10 and later on 5 rings.
const LAST_ROUND_ON_3_RINGS = 3;
const LAST_ROUND_ON_4_RINGS = 9;

export function ringCountForRound(round: number): number {
  if (round <= LAST_ROUND_ON_3_RINGS) return MIN_RING_COUNT;
  if (round <= LAST_ROUND_ON_4_RINGS) return MIN_RING_COUNT + 1;
  return MAX_RING_COUNT;
}

/**
 * Each larger web starts a little easier than the previous one ended:
 * 4 rings start at level 3, 5 rings at level 5.
 */
export function difficultyForRound(round: number): number {
  if (round <= LAST_ROUND_ON_3_RINGS) return round;
  if (round <= LAST_ROUND_ON_4_RINGS) return round - 1;
  return round - 5;
}

const SLOW = ENEMY_SLOW_FACTOR;
const FAST = ENEMY_FAST_FACTOR;
// Each new enemy arrives slow, then the enemies turn fast one at a time
// before the next one joins (spec chapter 6, levels 1 to 9).
const ENEMY_TABLE: readonly EnemySetup[] = [
  [SLOW],
  [FAST],
  [SLOW, SLOW],
  [SLOW, FAST],
  [FAST, FAST],
  [SLOW, SLOW, SLOW],
  [SLOW, SLOW, FAST],
  [SLOW, FAST, FAST],
  [FAST, FAST, FAST],
];

/** Speed factor of each enemy for the difficulty level; above the table, three fast ones speeding up. */
export function enemiesForDifficulty(level: number): EnemySetup {
  const row = ENEMY_TABLE[level - 1];
  if (row) return row;
  const extraLevels = level - ENEMY_TABLE.length;
  const factor = Math.min(FAST + ENEMY_SPEEDUP_PER_LEVEL * extraLevels, ENEMY_MAX_FACTOR);
  return [factor, factor, factor];
}

/** Whether the next round is played on a bigger web, so the player can be warned. */
export function webGrowsAfter(round: number): boolean {
  return ringCountForRound(round + 1) > ringCountForRound(round);
}
