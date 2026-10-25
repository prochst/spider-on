// Bonus packages (spec chapter 4): from round 6 a package now and then takes
// the place of a fly on the far side of the web. It stays until the player
// eats it or crawls past it on another ring.

import {
  BONUS_CHANCE_POINTS,
  BONUS_CHANCE_SLOWDOWN,
  BONUS_DELAY_MAX,
  BONUS_DELAY_MIN,
  FLY_PICKUP_ANGLE,
} from "./config";
import type { Fly } from "./flies";
import { normalizeAngle } from "./geometry";
import { pickRandom, type Random, randomBetween } from "./random";
import type { Spider } from "./spider";

export type BonusKind = "points" | "slowdown" | "life";
export type BonusPackage = { ring: number; angle: number; kind: BonusKind };

export type BonusState = {
  /** Packages appear only from round 6 on. */
  enabled: boolean;
  /** Seconds until the next package appears. */
  wait: number;
  package: BonusPackage | null;
  /** Angle the player still has to crawl before the enemies speed up again; 0 when there is no slowdown. */
  slowdownLeft: number;
};

const FULL_LAP = 2 * Math.PI;

export function createBonusState(enabled: boolean, random: Random): BonusState {
  return { enabled, wait: randomBetween(random, BONUS_DELAY_MIN, BONUS_DELAY_MAX), package: null, slowdownLeft: 0 };
}

export function rollBonusKind(random: Random): BonusKind {
  const roll = random();
  if (roll < BONUS_CHANCE_POINTS) return "points";
  if (roll < BONUS_CHANCE_POINTS + BONUS_CHANCE_SLOWDOWN) return "slowdown";
  return "life";
}

function angleBetween(a: number, b: number): number {
  const d = normalizeAngle(a - b);
  return Math.min(d, FULL_LAP - d);
}

/**
 * Turns a random fly on the far half of the web (90° or more from the
 * player) into a package. The fly counts as eaten. The last fly is never
 * taken: the round must still end by eating it.
 */
export function spawnPackage(flies: Fly[], player: Spider, random: Random): BonusPackage | null {
  const left = flies.filter((fly) => !fly.collected);
  if (left.length < 2) return null;
  const fly = pickRandom(
    random,
    left.filter((f) => angleBetween(f.angle, player.angle) >= Math.PI / 2),
  );
  if (!fly) return null;
  fly.collected = true;
  return { ring: fly.ring, angle: fly.angle, kind: rollBonusKind(random) };
}

/** Angle the player moved forward between two positions; 0 during a climb. */
function playerProgress(player: Spider, angleBefore: number): number {
  return normalizeAngle(player.direction * (player.angle - angleBefore));
}

/**
 * Advances the bonus state after the player has moved. Returns the kind of
 * package eaten in this step, or null. The slowdown is applied here; points
 * and lives are left to the caller, which owns the score.
 */
export function updateBonus(
  state: BonusState,
  flies: Fly[],
  player: Spider,
  angleBefore: number,
  dt: number,
  random: Random,
): BonusKind | null {
  const progress = playerProgress(player, angleBefore);
  if (state.slowdownLeft > 0) state.slowdownLeft = Math.max(0, state.slowdownLeft - progress);

  const pack = state.package;
  if (pack) {
    if (!player.crossing && player.ring === pack.ring && angleBetween(player.angle, pack.angle) < FLY_PICKUP_ANGLE) {
      endPackage(state, random);
      if (pack.kind === "slowdown") state.slowdownLeft = FULL_LAP;
      return pack.kind;
    }
    const ahead = normalizeAngle(player.direction * (pack.angle - angleBefore));
    if (player.ring !== pack.ring && progress > 0 && ahead <= progress) endPackage(state, random);
    return null;
  }

  if (!state.enabled) return null;
  state.wait -= dt;
  // With no fly on the far side the package simply waits for the next step.
  if (state.wait <= 0) state.package = spawnPackage(flies, player, random);
  return null;
}

function endPackage(state: BonusState, random: Random): void {
  state.package = null;
  state.wait = randomBetween(random, BONUS_DELAY_MIN, BONUS_DELAY_MAX);
}
