// Flies sit halfway between two spokes, twelve on every ring (spec chapter 3).

import { FLY_PICKUP_ANGLE, SPOKE_COUNT } from "./config";
import { normalizeAngle, SPOKE_STEP } from "./geometry";
import type { Spider } from "./spider";

export type Fly = { ring: number; angle: number; collected: boolean };

export function createFlies(ringCount: number): Fly[] {
  const flies: Fly[] = [];
  for (let ring = 0; ring < ringCount; ring++) {
    for (let slot = 0; slot < SPOKE_COUNT; slot++) {
      flies.push({ ring, angle: (slot + 0.5) * SPOKE_STEP, collected: false });
    }
  }
  return flies;
}

function angleBetween(a: number, b: number): number {
  const d = normalizeAngle(a - b);
  return Math.min(d, 2 * Math.PI - d);
}

/**
 * Collects every fly the player is touching and returns how many. At full
 * throttle on the inner ring the player moves about 0.035 rad per step, less
 * than the 0.12 rad wide pickup window, so no fly can be skipped between steps.
 * While climbing the player sits on a gate spoke, 15° away from any fly.
 */
export function collectFlies(flies: Fly[], player: Spider): number {
  if (player.crossing) return 0;
  let collected = 0;
  for (const fly of flies) {
    if (fly.collected || fly.ring !== player.ring) continue;
    if (angleBetween(fly.angle, player.angle) < FLY_PICKUP_ANGLE) {
      fly.collected = true;
      collected++;
    }
  }
  return collected;
}

export function fliesLeft(flies: readonly Fly[]): number {
  return flies.reduce((left, fly) => (fly.collected ? left : left + 1), 0);
}
