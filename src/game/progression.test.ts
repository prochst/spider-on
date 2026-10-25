import { describe, expect, it } from "vitest";
import { ENEMY_FAST_FACTOR, ENEMY_MAX_SPEEDUP, ENEMY_SLOW_FACTOR } from "./config";
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
  it("follows the enemy table for levels 1 to 6", () => {
    expect(enemiesForDifficulty(1)).toEqual({ count: 1, speedFactor: ENEMY_SLOW_FACTOR });
    expect(enemiesForDifficulty(2)).toEqual({ count: 1, speedFactor: ENEMY_FAST_FACTOR });
    expect(enemiesForDifficulty(3)).toEqual({ count: 2, speedFactor: ENEMY_SLOW_FACTOR });
    expect(enemiesForDifficulty(4)).toEqual({ count: 2, speedFactor: ENEMY_FAST_FACTOR });
    expect(enemiesForDifficulty(5)).toEqual({ count: 3, speedFactor: ENEMY_SLOW_FACTOR });
    expect(enemiesForDifficulty(6)).toEqual({ count: 3, speedFactor: ENEMY_FAST_FACTOR });
  });

  it("speeds up by 3 % per level above 6 up to 1.3 times", () => {
    expect(enemiesForDifficulty(7).speedFactor).toBeCloseTo(ENEMY_FAST_FACTOR * 1.03);
    expect(enemiesForDifficulty(10).speedFactor).toBeCloseTo(ENEMY_FAST_FACTOR * 1.12);
    expect(enemiesForDifficulty(16).speedFactor).toBeCloseTo(ENEMY_FAST_FACTOR * ENEMY_MAX_SPEEDUP);
    expect(enemiesForDifficulty(40).speedFactor).toBeCloseTo(ENEMY_FAST_FACTOR * ENEMY_MAX_SPEEDUP);
    expect(enemiesForDifficulty(40).count).toBe(3);
  });
});

describe("webGrowsAfter", () => {
  it("warns only before rounds 4 and 10", () => {
    const grows = Array.from({ length: 12 }, (_, i) => i + 1).filter(webGrowsAfter);
    expect(grows).toEqual([3, 9]);
  });
});
