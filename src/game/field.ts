// The playing field of one round: the web size, the player, the enemies,
// the flies and the bonus package, all at their start positions (spec
// chapters 3, 4, 5 and 7).

import { chooseEnemyTurn } from "./ai";
import { type BonusState, createBonusState } from "./bonus";
import { COLLISION_DISTANCE, PLAYER_SPEED, SLOWDOWN_FACTOR, THROTTLE_FACTOR } from "./config";
import { createFlies, type Fly } from "./flies";
import { createRandom, type Random } from "./random";
import {
  createSpider,
  reachesGate,
  requestTurn,
  type Spider,
  spiderPosition,
  stepSpider,
  type Turn,
} from "./spider";

export type Field = {
  ringCount: number;
  /** Difficulty level; decides how eagerly enemies chase the player. */
  level: number;
  player: Spider;
  enemies: Spider[];
  flies: Fly[];
  bonus: BonusState;
};

/** Speed of each enemy as a multiple of the player's base speed. */
export type EnemySetup = readonly number[];

const DEG = Math.PI / 180;
const PLAYER_START_ANGLE = 90 * DEG;
// Opposite the player and at most 45° to either side, so no enemy starts
// closer than a quarter of the web (90°) to the player.
const ENEMY_START_ANGLES = [270 * DEG, 225 * DEG, 315 * DEG];

/** Without a bonus state the round has no packages, as before round 6. */
export function createField(
  ringCount: number,
  enemies: EnemySetup,
  level = 1,
  bonus: BonusState = createBonusState(false, createRandom(0)),
): Field {
  return {
    ringCount,
    level,
    player: createSpider(ringCount - 1, PLAYER_START_ANGLE, -1, PLAYER_SPEED),
    enemies: enemies.map((speedFactor, i) => {
      // Inner rings only: the outer ring belongs to the player at the start.
      const ring = i % (ringCount - 1);
      const angle = ENEMY_START_ANGLES[i % ENEMY_START_ANGLES.length] ?? 270 * DEG;
      return createSpider(ring, angle, 1, PLAYER_SPEED * speedFactor);
    }),
    flies: createFlies(ringCount),
    bonus,
  };
}

export function steerPlayer(field: Field, turn: Turn, throttle: boolean): boolean {
  return requestTurn(field.player, turn, field.ringCount, throttle);
}

export function stepField(field: Field, dt: number, throttle: boolean, random: Random): void {
  const { ringCount, player } = field;
  stepSpider(player, dt, ringCount, throttle ? THROTTLE_FACTOR : 1);
  const enemySpeed = field.bonus.slowdownLeft > 0 ? SLOWDOWN_FACTOR : 1;
  for (const enemy of field.enemies) {
    // Decide on the very step the enemy reaches a gate, so it reacts to where the player is heading right now.
    if (!enemy.pending && reachesGate(enemy, dt, ringCount, enemySpeed)) {
      const turn = chooseEnemyTurn(enemy, player, field.level, random);
      if (turn) requestTurn(enemy, turn, ringCount, false);
    }
    stepSpider(enemy, dt, ringCount, enemySpeed);
  }
}

/**
 * Whether the player touches an enemy. Distances between centres work during
 * a climb too, so a spider on a spoke can be hit. Head-on, the two close in by
 * at most 0.02 R per step, far less than the collision distance, so they
 * cannot pass through each other between steps.
 */
export function playerHitsEnemy(field: Field): boolean {
  const p = spiderPosition(field.player, field.ringCount);
  return field.enemies.some((enemy) => {
    const e = spiderPosition(enemy, field.ringCount);
    return Math.hypot(p.x - e.x, p.y - e.y) < COLLISION_DISTANCE;
  });
}
