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
export const PLAYER_SPEED = 0.336;
/** Speed multiplier while the throttle is held. */
export const THROTTLE_FACTOR = 1.7;
/** A ring change is remembered only when asked for this close before a gate spoke (30°). */
export const TURN_ZONE = (30 * Math.PI) / 180;
/** Time to climb from one ring to the next along a gate spoke. */
export const CROSSING_TIME = 0.3;
/** Enemy speeds as multiples of PLAYER_SPEED; every enemy stays within 0.2 to 0.8. */
export const ENEMY_SLOW_FACTOR = 0.2;
/** Fast enemies first appear on difficulty 2 at this speed... */
export const ENEMY_FAST_FACTOR = 0.4;
/** ...and gain this much on each further level, up to ENEMY_MAX_FACTOR (on level 22). */
export const ENEMY_SPEEDUP_PER_LEVEL = 0.02;
export const ENEMY_MAX_FACTOR = 0.8;

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
export const BONUS_FIRST_ROUND = 4;
/** The next package appears after a random wait in this range, in seconds. */
export const BONUS_DELAY_MIN = 5;
export const BONUS_DELAY_MAX = 20;
export const BONUS_POINTS = 250;
/** Chances of the package contents; they add up to 1. */
export const BONUS_CHANCE_POINTS = 0.75;
export const BONUS_CHANCE_SLOWDOWN = 0.22;
export const BONUS_CHANCE_LIFE = 0.03;
/**
 * Touch controls (spec chapter 11), in CSS pixels and seconds. They live here
 * with the other tunable values, although only the input layer reads them.
 */
export const SWIPE_MIN_DISTANCE = 24;
export const TAP_MAX_DISTANCE = 10;
export const TAP_MAX_TIME = 0.3;

/** How long the message about an eaten package stays in the middle of the web. */
export const BONUS_NOTICE_TIME = 3;
/** Enemy speed multiplier while the slowdown lasts (one full lap of the player). */
export const SLOWDOWN_FACTOR = 0.5;

/** The score table and the player name (spec chapter 10). */
export const SCORE_TABLE_SIZE = 10;
export const PLAYER_NAME_MAX_LENGTH = 16;
export const DEFAULT_PLAYER_NAME = "Hráč";
