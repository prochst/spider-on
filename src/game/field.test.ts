import { describe, expect, it } from "vitest";
import { ENEMY_FAST_FACTOR, ENEMY_SLOW_FACTOR, FIXED_STEP, MAX_RING_COUNT, MIN_RING_COUNT, PLAYER_SPEED } from "./config";
import { createField, playerHitsEnemy, stepField } from "./field";
import { createRandom } from "./random";

const random = createRandom(1);

function angleBetween(a: number, b: number): number {
  const d = Math.abs(a - b) % (2 * Math.PI);
  return Math.min(d, 2 * Math.PI - d);
}

describe("createField", () => {
  it("puts the player on the outer ring at the bottom", () => {
    for (let rings = MIN_RING_COUNT; rings <= MAX_RING_COUNT; rings++) {
      const { player } = createField(rings, []);
      expect(player.ring).toBe(rings - 1);
      expect(player.angle).toBeCloseTo(Math.PI / 2);
      expect(player.direction).toBe(-1);
    }
  });

  it("puts enemies on inner rings at least a quarter of the web away", () => {
    for (let rings = MIN_RING_COUNT; rings <= MAX_RING_COUNT; rings++) {
      const field = createField(rings, [ENEMY_FAST_FACTOR, ENEMY_FAST_FACTOR, ENEMY_FAST_FACTOR]);
      expect(field.enemies).toHaveLength(3);
      for (const enemy of field.enemies) {
        expect(enemy.ring).toBeLessThan(rings - 1);
        expect(enemy.direction).toBe(1);
        expect(angleBetween(enemy.angle, field.player.angle)).toBeGreaterThanOrEqual(Math.PI / 2);
      }
    }
  });

  it("gives enemies their speed relative to the player", () => {
    const field = createField(3, [ENEMY_SLOW_FACTOR]);
    expect(field.enemies[0]?.speed).toBeCloseTo(PLAYER_SPEED * ENEMY_SLOW_FACTOR);
  });
});

describe("stepField", () => {
  it("moves the player and every enemy", () => {
    const field = createField(4, [1, 1]);
    const before = [field.player, ...field.enemies].map((s) => s.angle);
    stepField(field, FIXED_STEP, false, random);
    const after = [field.player, ...field.enemies].map((s) => s.angle);
    after.forEach((angle, i) => expect(angle).not.toBe(before[i]));
  });

  it("speeds up only the player with the throttle", () => {
    const plain = createField(3, [1]);
    const fast = createField(3, [1]);
    stepField(plain, 0.1, false, random);
    stepField(fast, 0.1, true, random);
    expect(fast.player.angle).toBeLessThan(plain.player.angle);
    expect(fast.enemies[0]?.angle).toBe(plain.enemies[0]?.angle);
  });
});

describe("playerHitsEnemy", () => {
  it("does not report a crash at the start", () => {
    for (const rings of [3, 4, 5]) expect(playerHitsEnemy(createField(rings, [1, 1, 1]))).toBe(false);
  });

  it("reports a head-on meeting on the same ring", () => {
    const field = createField(3, [1]);
    const enemy = field.enemies[0]!;
    enemy.ring = field.player.ring;
    enemy.angle = field.player.angle - 0.5;
    let hit = false;
    for (let i = 0; i < 120 && !hit; i++) {
      stepField(field, FIXED_STEP, false, random);
      hit = playerHitsEnemy(field);
    }
    expect(hit).toBe(true);
  });

  it("ignores enemies on a neighbouring ring", () => {
    const field = createField(3, [1]);
    const enemy = field.enemies[0]!;
    enemy.ring = 1;
    enemy.angle = field.player.angle;
    expect(playerHitsEnemy(field)).toBe(false);
  });
});

describe("enemy behaviour in the field", () => {
  it("climbs toward the player at a gate when the draw says so", () => {
    const field = createField(3, [1]);
    const enemy = field.enemies[0]!;
    // Just before the right gate (0°), crawling clockwise on the inner ring.
    enemy.angle = 2 * Math.PI - 0.01;
    for (let i = 0; i < 10 && !enemy.crossing; i++) stepField(field, FIXED_STEP, false, () => 0);
    expect(enemy.crossing).toEqual(expect.objectContaining({ from: 0, to: 1 }));
  });

  it("keeps its ring when the draw says no", () => {
    const field = createField(3, [1]);
    const enemy = field.enemies[0]!;
    enemy.angle = 2 * Math.PI - 0.01;
    for (let i = 0; i < 10; i++) stepField(field, FIXED_STEP, false, () => 0.999);
    expect(enemy.crossing).toBeNull();
    expect(enemy.ring).toBe(0);
  });

  it("slows the enemies to half speed during a slowdown", () => {
    const normal = createField(3, [1]);
    const slowed = createField(3, [1]);
    slowed.bonus.slowdownLeft = 2 * Math.PI;
    stepField(normal, 0.1, false, random);
    stepField(slowed, 0.1, false, random);
    const start = 270 * (Math.PI / 180);
    expect(slowed.enemies[0]!.angle - start).toBeCloseTo((normal.enemies[0]!.angle - start) / 2);
  });
});
