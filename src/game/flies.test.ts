import { describe, expect, it } from "vitest";
import { FIXED_STEP, PLAYER_SPEED, SPOKE_COUNT, THROTTLE_FACTOR } from "./config";
import { collectFlies, createFlies, fliesLeft } from "./flies";
import { SPOKE_STEP } from "./geometry";
import { createSpider, requestTurn, stepSpider } from "./spider";

describe("createFlies", () => {
  it("puts twelve flies on every ring, halfway between spokes", () => {
    for (const rings of [3, 4, 5]) {
      const flies = createFlies(rings);
      expect(flies).toHaveLength(rings * SPOKE_COUNT);
      for (const fly of flies) expect((fly.angle / SPOKE_STEP) % 1).toBeCloseTo(0.5);
    }
  });
});

describe("collectFlies", () => {
  it("collects a fly on the player's ring within the pickup angle", () => {
    const flies = createFlies(3);
    const player = createSpider(2, SPOKE_STEP / 2 + 0.05, -1, PLAYER_SPEED);
    expect(collectFlies(flies, player)).toBe(1);
    expect(fliesLeft(flies)).toBe(3 * SPOKE_COUNT - 1);
    // A fly is collected only once.
    expect(collectFlies(flies, player)).toBe(0);
  });

  it("ignores flies on other rings and farther away", () => {
    const flies = createFlies(3);
    expect(collectFlies(flies, createSpider(2, SPOKE_STEP / 2 + 0.07, -1, PLAYER_SPEED))).toBe(0);
    const onRing1 = flies.filter((f) => f.ring === 1 && !f.collected).length;
    collectFlies(flies, createSpider(2, SPOKE_STEP / 2, -1, PLAYER_SPEED));
    expect(flies.filter((f) => f.ring === 1 && !f.collected).length).toBe(onRing1);
  });

  it("clears a whole ring in one lap, even at full throttle on the inner ring", () => {
    const flies = createFlies(3);
    const player = createSpider(0, Math.PI / 2, -1, PLAYER_SPEED);
    const lap = (2 * Math.PI * 0.28) / (PLAYER_SPEED * THROTTLE_FACTOR);
    for (let t = 0; t < lap + 0.1; t += FIXED_STEP) {
      stepSpider(player, FIXED_STEP, 3, THROTTLE_FACTOR);
      collectFlies(flies, player);
    }
    expect(flies.filter((f) => f.ring === 0 && !f.collected)).toHaveLength(0);
  });

  it("collects nothing while climbing between rings", () => {
    const flies = createFlies(3);
    const player = createSpider(2, Math.PI / 2 + 0.05, -1, PLAYER_SPEED);
    requestTurn(player, "in", 3, false);
    while (!player.crossing) stepSpider(player, FIXED_STEP, 3);
    // Pretend a fly sits right on the spoke to prove the climb skips collection.
    flies.push({ ring: 2, angle: Math.PI / 2, collected: false });
    expect(collectFlies(flies, player)).toBe(0);
  });
});
