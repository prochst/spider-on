// How the game gets harder (spec chapter 6): the round number decides the
// size of the web and the difficulty level, the level decides the enemies.

import {
  ENEMY_FAST_FACTOR,
  ENEMY_MAX_SPEEDUP,
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

/** Levels 1–5 alternate slow and fast with one more enemy every two levels; from 6 on, three fast ones speeding up. */
export function enemiesForDifficulty(level: number): EnemySetup {
  if (level >= 6) {
    const speedup = Math.min(1 + ENEMY_SPEEDUP_PER_LEVEL * (level - 6), ENEMY_MAX_SPEEDUP);
    return { count: 3, speedFactor: ENEMY_FAST_FACTOR * speedup };
  }
  const count = Math.ceil(level / 2);
  const fast = level % 2 === 0;
  return { count, speedFactor: fast ? ENEMY_FAST_FACTOR : ENEMY_SLOW_FACTOR };
}

/** Whether the next round is played on a bigger web, so the player can be warned. */
export function webGrowsAfter(round: number): boolean {
  return ringCountForRound(round + 1) > ringCountForRound(round);
}
