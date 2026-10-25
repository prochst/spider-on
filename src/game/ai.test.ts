import { describe, expect, it } from "vitest";
import { AI_TURN_CHANCE_MAX, PLAYER_SPEED } from "./config";
import { chooseEnemyTurn, playerTargetRing, turnChance } from "./ai";
import { createRandom } from "./random";
import { createSpider } from "./spider";

const always = () => 0;
const never = () => 0.999;

describe("turnChance", () => {
  it("starts at 0.6 and grows by 0.05 per level up to 0.95", () => {
    expect(turnChance(1)).toBeCloseTo(0.6);
    expect(turnChance(2)).toBeCloseTo(0.65);
    expect(turnChance(8)).toBeCloseTo(0.95);
    expect(turnChance(20)).toBe(AI_TURN_CHANCE_MAX);
  });
});

describe("playerTargetRing", () => {
  it("is the current ring, the ring of a remembered turn, or the end of a climb", () => {
    const player = createSpider(2, 1, -1, PLAYER_SPEED);
    expect(playerTargetRing(player)).toBe(2);
    player.pending = "in";
    expect(playerTargetRing(player)).toBe(1);
    player.pending = null;
    player.crossing = { from: 2, to: 1, elapsed: 0, continues: false };
    expect(playerTargetRing(player)).toBe(1);
    player.crossing.continues = true;
    expect(playerTargetRing(player)).toBe(0);
  });
});

describe("chooseEnemyTurn", () => {
  const enemyOn = (ring: number) => createSpider(ring, 0, 1, PLAYER_SPEED);
  const playerOn = (ring: number) => createSpider(ring, 1, -1, PLAYER_SPEED);

  it("climbs one ring toward the player", () => {
    expect(chooseEnemyTurn(enemyOn(0), playerOn(2), 1, always)).toBe("out");
    expect(chooseEnemyTurn(enemyOn(3), playerOn(1), 1, always)).toBe("in");
  });

  it("keeps crawling when it loses the draw or already shares the ring", () => {
    expect(chooseEnemyTurn(enemyOn(0), playerOn(2), 1, never)).toBeNull();
    expect(chooseEnemyTurn(enemyOn(2), playerOn(2), 1, always)).toBeNull();
  });

  it("follows a remembered turn of the player", () => {
    const player = playerOn(2);
    player.pending = "in";
    expect(chooseEnemyTurn(enemyOn(1), player, 1, always)).toBeNull();
    expect(chooseEnemyTurn(enemyOn(0), player, 1, always)).toBe("out");
  });

  it("turns about as often as the chance for its level says", () => {
    const random = createRandom(11);
    for (const level of [1, 5, 8]) {
      let turns = 0;
      const n = 20_000;
      for (let i = 0; i < n; i++) if (chooseEnemyTurn(enemyOn(0), playerOn(2), level, random)) turns++;
      expect(turns / n).toBeCloseTo(turnChance(level), 1);
    }
  });
});
