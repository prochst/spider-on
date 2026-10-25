// The playing field of one round: the web size, the player and the enemies,
// all at their start positions (spec chapters 5 and 7).

import { PLAYER_SPEED, THROTTLE_FACTOR } from "./config";
import { createSpider, requestTurn, type Spider, stepSpider, type Turn } from "./spider";

export type Field = {
  ringCount: number;
  player: Spider;
  enemies: Spider[];
};

export type EnemySetup = {
  count: number;
  /** Enemy speed as a multiple of the player's base speed. */
  speedFactor: number;
};

const DEG = Math.PI / 180;
const PLAYER_START_ANGLE = 90 * DEG;
// Opposite the player and at most 45° to either side, so no enemy starts
// closer than a quarter of the web (90°) to the player.
const ENEMY_START_ANGLES = [270 * DEG, 225 * DEG, 315 * DEG];

export function createField(ringCount: number, enemies: EnemySetup): Field {
  return {
    ringCount,
    player: createSpider(ringCount - 1, PLAYER_START_ANGLE, -1, PLAYER_SPEED),
    enemies: Array.from({ length: enemies.count }, (_, i) => {
      // Inner rings only: the outer ring belongs to the player at the start.
      const ring = i % (ringCount - 1);
      const angle = ENEMY_START_ANGLES[i % ENEMY_START_ANGLES.length] ?? 270 * DEG;
      return createSpider(ring, angle, 1, PLAYER_SPEED * enemies.speedFactor);
    }),
  };
}

export function steerPlayer(field: Field, turn: Turn, throttle: boolean): boolean {
  return requestTurn(field.player, turn, field.ringCount, throttle);
}

export function stepField(field: Field, dt: number, throttle: boolean): void {
  stepSpider(field.player, dt, field.ringCount, throttle ? THROTTLE_FACTOR : 1);
  for (const enemy of field.enemies) stepSpider(enemy, dt, field.ringCount);
}
