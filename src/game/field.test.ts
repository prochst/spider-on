import { describe, expect, it } from "vitest";
import { ENEMY_FAST_FACTOR, ENEMY_SLOW_FACTOR, FIXED_STEP, MAX_RING_COUNT, MIN_RING_COUNT, PLAYER_SPEED } from "./config";
import { createField, playerHitsEnemy, stepField } from "./field";

function angleBetween(a: number, b: number): number {
  const d = Math.abs(a - b) % (2 * Math.PI);
  return Math.min(d, 2 * Math.PI - d);
}

describe("createField", () => {
  it("puts the player on the outer ring at the bottom", () => {
    for (let rings = MIN_RING_COUNT; rings <= MAX_RING_COUNT; rings++) {
      const { player } = createField(rings, { count: 0, speedFactor: 1 });
      expect(player.ring).toBe(rings - 1);
      expect(player.angle).toBeCloseTo(Math.PI / 2);
      expect(player.direction).toBe(-1);
    }
  });

  it("puts enemies on inner rings at least a quarter of the web away", () => {
    for (let rings = MIN_RING_COUNT; rings <= MAX_RING_COUNT; rings++) {
      const field = createField(rings, { count: 3, speedFactor: ENEMY_FAST_FACTOR });
      expect(field.enemies).toHaveLength(3);
      for (const enemy of field.enemies) {
        expect(enemy.ring).toBeLessThan(rings - 1);
        expect(enemy.direction).toBe(1);
        expect(angleBetween(enemy.angle, field.player.angle)).toBeGreaterThanOrEqual(Math.PI / 2);
      }
    }
  });

  it("gives enemies their speed relative to the player", () => {
    const field = createField(3, { count: 1, speedFactor: ENEMY_SLOW_FACTOR });
    expect(field.enemies[0]?.speed).toBeCloseTo(PLAYER_SPEED * ENEMY_SLOW_FACTOR);
  });
});

describe("stepField", () => {
  it("moves the player and every enemy", () => {
    const field = createField(4, { count: 2, speedFactor: 1 });
    const before = [field.player, ...field.enemies].map((s) => s.angle);
    stepField(field, FIXED_STEP, false);
    const after = [field.player, ...field.enemies].map((s) => s.angle);
    after.forEach((angle, i) => expect(angle).not.toBe(before[i]));
  });

  it("speeds up only the player with the throttle", () => {
    const plain = createField(3, { count: 1, speedFactor: 1 });
    const fast = createField(3, { count: 1, speedFactor: 1 });
    stepField(plain, 0.1, false);
    stepField(fast, 0.1, true);
    expect(fast.player.angle).toBeLessThan(plain.player.angle);
    expect(fast.enemies[0]?.angle).toBe(plain.enemies[0]?.angle);
  });
});

describe("playerHitsEnemy", () => {
  it("does not report a crash at the start", () => {
    for (const rings of [3, 4, 5]) expect(playerHitsEnemy(createField(rings, { count: 3, speedFactor: 1 }))).toBe(false);
  });

  it("reports a head-on meeting on the same ring", () => {
    const field = createField(3, { count: 1, speedFactor: 1 });
    const enemy = field.enemies[0]!;
    enemy.ring = field.player.ring;
    enemy.angle = field.player.angle - 0.5;
    let hit = false;
    for (let i = 0; i < 120 && !hit; i++) {
      stepField(field, FIXED_STEP, false);
      hit = playerHitsEnemy(field);
    }
    expect(hit).toBe(true);
  });

  it("ignores enemies on a neighbouring ring", () => {
    const field = createField(3, { count: 1, speedFactor: 1 });
    const enemy = field.enemies[0]!;
    enemy.ring = 1;
    enemy.angle = field.player.angle;
    expect(playerHitsEnemy(field)).toBe(false);
  });
});
