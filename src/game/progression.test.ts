import { describe, expect, it } from "vitest";
import { ENEMY_FAST_FACTOR, ENEMY_MAX_FACTOR, ENEMY_SLOW_FACTOR } from "./config";
import { difficultyForRound, enemiesForDifficulty, fastEnemyFactor, ringCountForRound, webGrowsAfter } from "./progression";

describe("ringCountForRound", () => {
  it("follows the table in spec chapter 6", () => {
    const rings = Array.from({ length: 12 }, (_, i) => ringCountForRound(i + 1));
    expect(rings).toEqual([3, 3, 3, 4, 4, 4, 4, 4, 4, 5, 5, 5]);
  });
});

describe("difficultyForRound", () => {
  it("restarts lower on each bigger web", () => {
    const levels = Array.from({ length: 12 }, (_, i) => difficultyForRound(i + 1));
    expect(levels).toEqual([1, 2, 3, 3, 4, 5, 6, 7, 8, 5, 6, 7]);
  });
});

describe("enemiesForDifficulty", () => {
  const S = ENEMY_SLOW_FACTOR;

  it("follows the enemy table for levels 1 to 9", () => {
    const table = Array.from({ length: 9 }, (_, i) => enemiesForDifficulty(i + 1));
    const F = fastEnemyFactor;
    expect(table).toEqual([
      [S],
      [F(2)],
      [S, S],
      [S, F(4)],
      [F(5), F(5)],
      [S, S, S],
      [S, S, F(7)],
      [S, F(8), F(8)],
      [F(9), F(9), F(9)],
    ]);
  });

  it("speeds fast enemies up slowly from level 2 to the maximum on level 22", () => {
    expect(fastEnemyFactor(2)).toBeCloseTo(ENEMY_FAST_FACTOR);
    expect(fastEnemyFactor(9)).toBeCloseTo(0.54);
    expect(fastEnemyFactor(22)).toBeCloseTo(ENEMY_MAX_FACTOR);
    expect(enemiesForDifficulty(40)).toEqual([ENEMY_MAX_FACTOR, ENEMY_MAX_FACTOR, ENEMY_MAX_FACTOR]);
  });

  it("keeps every enemy between 0.2 and 0.8 times the player's speed", () => {
    for (let level = 1; level <= 40; level++) {
      for (const factor of enemiesForDifficulty(level)) {
        expect(factor).toBeGreaterThanOrEqual(0.2);
        expect(factor).toBeLessThanOrEqual(0.8 + 1e-9);
      }
    }
  });
});

describe("webGrowsAfter", () => {
  it("warns only before rounds 4 and 10", () => {
    const grows = Array.from({ length: 12 }, (_, i) => i + 1).filter(webGrowsAfter);
    expect(grows).toEqual([3, 9]);
  });
});
