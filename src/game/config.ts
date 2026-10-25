// Tunable constants from docs/specifikace.md. Distances are in units of R
// (half the side of the square play area), times in seconds.

/** The web grows from 3 to 5 rings as the game progresses. */
export const MIN_RING_COUNT = 3;
export const MAX_RING_COUNT = 5;
export const SPOKE_COUNT = 12;
/** Spoke indices where a spider may switch rings: right, bottom, left, top. */
export const GATE_SPOKES = [0, 3, 6, 9] as const;
export const INNER_RING_RADIUS = 0.28;
export const OUTER_RING_RADIUS = 0.92;
/** How far each ring segment sags toward the centre, as a fraction of its chord distance. */
export const SEGMENT_SAG = 0.06;

/** The simulation always advances in this step, so results do not depend on the frame rate. */
export const FIXED_STEP = 1 / 120;
/**
 * Longest frame the loop will catch up on. After a long stall (a background
 * tab, a debugger pause) we drop the extra time instead of running hundreds of
 * steps at once and freezing the page.
 */
export const MAX_FRAME_TIME = 0.25;

/** Length of the crash animation before the field resets. */
export const CRASH_DURATION = 1.1;
export const START_LIVES = 3;
export const MAX_LIVES = 5;

/** Player speed along the ring in R per second; constant along the ring, so inner laps are quicker. */
export const PLAYER_SPEED = 0.42;
/** Speed multiplier while the throttle is held. */
export const THROTTLE_FACTOR = 1.7;
/** A ring change is remembered only when asked for this close before a gate spoke (15°). */
export const TURN_ZONE = (15 * Math.PI) / 180;
/** Time to climb from one ring to the next along a gate spoke. */
export const CROSSING_TIME = 0.3;
/** Enemy speeds as multiples of PLAYER_SPEED. */
export const ENEMY_SLOW_FACTOR = 0.75;
export const ENEMY_FAST_FACTOR = 1.0;
/** From difficulty 6 on, enemies get 3 % faster per level, up to 1.3 times. */
export const ENEMY_SPEEDUP_PER_LEVEL = 0.03;
export const ENEMY_MAX_SPEEDUP = 1.3;

/** Flies are collected when the player is on their ring and closer than this angle (radians). */
export const FLY_PICKUP_ANGLE = 0.06;
/** The player crashes when the centres of two spiders are closer than this (in R). */
export const COLLISION_DISTANCE = 0.075;

export const FLY_POINTS = 10;
/** Finishing a round gives this times the round number. */
export const ROUND_BONUS_PER_ROUND = 100;
/** The first extra life comes at this score, then one every EXTRA_LIFE_EVERY points. */
export const EXTRA_LIFE_FIRST = 5000;
export const EXTRA_LIFE_EVERY = 10000;

/** Chance that an enemy climbs toward the player at a gate: 0.6 on level 1, +0.05 per level, at most 0.95. */
export const AI_TURN_CHANCE_START = 0.6;
export const AI_TURN_CHANCE_STEP = 0.05;
export const AI_TURN_CHANCE_MAX = 0.95;

/** Bonus packages appear from this round on (spec chapter 4). */
export const BONUS_FIRST_ROUND = 6;
/** The next package appears after a random wait in this range, in seconds. */
export const BONUS_DELAY_MIN = 5;
export const BONUS_DELAY_MAX = 20;
export const BONUS_POINTS = 250;
/** Chances of the package contents; they add up to 1. */
export const BONUS_CHANCE_POINTS = 0.75;
export const BONUS_CHANCE_SLOWDOWN = 0.22;
export const BONUS_CHANCE_LIFE = 0.03;
/** Enemy speed multiplier while the slowdown lasts (one full lap of the player). */
export const SLOWDOWN_FACTOR = 0.5;
