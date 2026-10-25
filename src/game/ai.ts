// Enemy behaviour (spec chapter 7): on every gate spoke an enemy either
// climbs one ring toward the player or keeps crawling. Nothing more: the
// danger comes from the head-on direction, not from clever planning.

import { AI_TURN_CHANCE_MAX, AI_TURN_CHANCE_START, AI_TURN_CHANCE_STEP } from "./config";
import type { Random } from "./random";
import type { Spider, Turn } from "./spider";

export function turnChance(level: number): number {
  return Math.min(AI_TURN_CHANCE_START + AI_TURN_CHANCE_STEP * (level - 1), AI_TURN_CHANCE_MAX);
}

/**
 * The ring the player is heading for: the end of the current climb, the
 * ring of a remembered turn, or else the ring the player is on.
 */
export function playerTargetRing(player: Spider): number {
  const { crossing } = player;
  if (crossing) {
    const step = crossing.to - crossing.from;
    return crossing.continues ? crossing.to + step : crossing.to;
  }
  if (player.pending) return player.pending === "in" ? player.ring - 1 : player.ring + 1;
  return player.ring;
}

/** The enemy's choice at a gate: one ring toward the player's target, or null to keep crawling. */
export function chooseEnemyTurn(enemy: Spider, player: Spider, level: number, random: Random): Turn | null {
  const target = playerTargetRing(player);
  if (target === enemy.ring) return null;
  // Draw only when there is a choice to make, so the sequence of random
  // numbers does not depend on how often enemies already share the ring.
  if (random() >= turnChance(level)) return null;
  return target < enemy.ring ? "in" : "out";
}
