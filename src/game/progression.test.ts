import { describe, expect, it } from "vitest";
import { ENEMY_FAST_FACTOR, ENEMY_MAX_FACTOR, ENEMY_SLOW_FACTOR } from "./config";
import { difficultyForRound, enemiesForDifficulty, ringCountForRound, webGrowsAfter } from "./progression";

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
  const F = ENEMY_FAST_FACTOR;

  it("follows the enemy table for levels 1 to 9", () => {
    const table = Array.from({ length: 9 }, (_, i) => enemiesForDifficulty(i + 1));
    expect(table).toEqual([[S], [F], [S, S], [S, F], [F, F], [S, S, S], [S, S, F], [S, F, F], [F, F, F]]);
  });

  it("speeds the three fast enemies up above level 9, never over the maximum", () => {
    expect(enemiesForDifficulty(10)).toEqual([0.65, 0.65, 0.65].map((f) => expect.closeTo(f)));
    expect(enemiesForDifficulty(15)[0]).toBeCloseTo(ENEMY_MAX_FACTOR);
    expect(enemiesForDifficulty(40)).toEqual([ENEMY_MAX_FACTOR, ENEMY_MAX_FACTOR, ENEMY_MAX_FACTOR]);
  });

  it("keeps every enemy between 0.3 and 0.9 times the player's speed", () => {
    for (let level = 1; level <= 40; level++) {
      for (const factor of enemiesForDifficulty(level)) {
        expect(factor).toBeGreaterThanOrEqual(0.3);
        expect(factor).toBeLessThanOrEqual(0.9 + 1e-9);
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
