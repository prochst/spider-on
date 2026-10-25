import { describe, expect, it } from "vitest";
import {
  BONUS_CHANCE_LIFE,
  BONUS_CHANCE_POINTS,
  BONUS_CHANCE_SLOWDOWN,
  BONUS_DELAY_MAX,
  BONUS_DELAY_MIN,
  FIXED_STEP,
  PLAYER_SPEED,
} from "./config";
import { type BonusState, createBonusState, rollBonusKind, spawnPackage, updateBonus } from "./bonus";
import { createFlies } from "./flies";
import { normalizeAngle, ringRadius } from "./geometry";
import { createRandom } from "./random";
import { createSpider, type Spider, stepSpider } from "./spider";

const DEG = Math.PI / 180;

function angleBetween(a: number, b: number): number {
  const d = normalizeAngle(a - b);
  return Math.min(d, 2 * Math.PI - d);
}

/** Time to crawl the given angle on the outer ring of three. */
function timeToCrawl(degrees: number): number {
  return (degrees * DEG * ringRadius(2, 3)) / PLAYER_SPEED;
}

function playerAt(ring: number, angleDeg: number): Spider {
  return createSpider(ring, angleDeg * DEG, -1, PLAYER_SPEED);
}

describe("rollBonusKind", () => {
  it("has chances that add up to one", () => {
    expect(BONUS_CHANCE_POINTS + BONUS_CHANCE_SLOWDOWN + BONUS_CHANCE_LIFE).toBeCloseTo(1);
  });

  it("follows the 75 / 22 / 3 % split", () => {
    const random = createRandom(5);
    const counts = { points: 0, slowdown: 0, life: 0 };
    const n = 100_000;
    for (let i = 0; i < n; i++) counts[rollBonusKind(random)]++;
    expect(counts.points / n).toBeCloseTo(BONUS_CHANCE_POINTS, 2);
    expect(counts.slowdown / n).toBeCloseTo(BONUS_CHANCE_SLOWDOWN, 2);
    expect(counts.life / n).toBeCloseTo(BONUS_CHANCE_LIFE, 2);
  });
});

describe("spawnPackage", () => {
  it("replaces a fly on the far half of the web and counts it as eaten", () => {
    const random = createRandom(9);
    for (let i = 0; i < 200; i++) {
      const flies = createFlies(4);
      const player = playerAt(3, random() * 360);
      const pack = spawnPackage(flies, player, random)!;
      expect(angleBetween(pack.angle, player.angle)).toBeGreaterThanOrEqual(Math.PI / 2);
      const fly = flies.find((f) => f.ring === pack.ring && f.angle === pack.angle)!;
      expect(fly.collected).toBe(true);
      expect(flies.filter((f) => f.collected)).toHaveLength(1);
    }
  });

  it("never takes the last fly", () => {
    const flies = createFlies(3);
    for (const fly of flies) fly.collected = true;
    flies[6]!.collected = false;
    expect(spawnPackage(flies, playerAt(2, 0), createRandom(1))).toBeNull();
    expect(flies[6]!.collected).toBe(false);
  });

  it("waits when no fly is left on the far side", () => {
    const flies = createFlies(3).map((f) => ({ ...f, collected: angleBetween(f.angle, 90 * DEG) >= Math.PI / 2 }));
    expect(spawnPackage(flies, playerAt(2, 90), createRandom(1))).toBeNull();
  });
});

describe("updateBonus", () => {
  const random = createRandom(3);

  function stateWithPackage(ring: number, angleDeg: number, kind: "points" | "slowdown" | "life"): BonusState {
    return { enabled: true, wait: 0, package: { ring, angle: angleDeg * DEG, kind }, slowdownLeft: 0 };
  }

  /** Steps the player and the bonus together, as the game does, and returns what was eaten. */
  function crawl(state: BonusState, player: Spider, seconds: number) {
    const eaten = [];
    const flies = createFlies(3);
    for (let t = 0; t < seconds; t += FIXED_STEP) {
      const before = player.angle;
      stepSpider(player, FIXED_STEP, 3);
      const kind = updateBonus(state, flies, player, before, FIXED_STEP, random);
      if (kind) eaten.push(kind);
    }
    return eaten;
  }

  it("does nothing before round 6", () => {
    const state = createBonusState(false, random);
    crawl(state, playerAt(2, 90), 30);
    expect(state.package).toBeNull();
  });

  it("brings the first package after 5 to 20 seconds", () => {
    for (let seed = 0; seed < 20; seed++) {
      const r = createRandom(seed);
      const state = createBonusState(true, r);
      expect(state.wait).toBeGreaterThanOrEqual(BONUS_DELAY_MIN);
      expect(state.wait).toBeLessThan(BONUS_DELAY_MAX);
      const flies = createFlies(3);
      const player = playerAt(2, 90);
      let t = 0;
      while (!state.package && t < 30) {
        updateBonus(state, flies, player, player.angle, FIXED_STEP, r);
        t += FIXED_STEP;
      }
      expect(t).toBeGreaterThanOrEqual(BONUS_DELAY_MIN - FIXED_STEP);
      expect(t).toBeLessThan(BONUS_DELAY_MAX + FIXED_STEP);
    }
  });

  it("is eaten on the same ring and starts the wait for the next one", () => {
    const state = stateWithPackage(2, 75, "points");
    expect(crawl(state, playerAt(2, 90), timeToCrawl(20))).toEqual(["points"]);
    expect(state.package).toBeNull();
    expect(state.wait).toBeGreaterThanOrEqual(BONUS_DELAY_MIN);
  });

  it("disappears when the player crawls past it on another ring", () => {
    const state = stateWithPackage(1, 75, "points");
    expect(crawl(state, playerAt(2, 90), 0.1)).toEqual([]);
    expect(state.package).not.toBeNull();
    expect(crawl(state, playerAt(2, 80), timeToCrawl(10))).toEqual([]);
    expect(state.package).toBeNull();
  });

  it("slows the enemies until the player has crawled one full lap", () => {
    const state = stateWithPackage(2, 75, "slowdown");
    const player = playerAt(2, 90);
    crawl(state, player, timeToCrawl(20));
    expect(state.slowdownLeft).toBeGreaterThan(0);
    const lap = (2 * Math.PI * ringRadius(2, 3)) / PLAYER_SPEED;
    crawl(state, player, lap - timeToCrawl(40));
    expect(state.slowdownLeft).toBeGreaterThan(0);
    crawl(state, player, timeToCrawl(40));
    expect(state.slowdownLeft).toBe(0);
  });
});
