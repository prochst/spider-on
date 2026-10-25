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
export const PLAYER_SPEED = 0.7;
/** Speed multiplier while the throttle is held. */
export const THROTTLE_FACTOR = 1.7;
/** A ring change is remembered only when asked for this close before a gate spoke (15°). */
export const TURN_ZONE = (15 * Math.PI) / 180;
/** Time to climb from one ring to the next along a gate spoke. */
export const CROSSING_TIME = 0.3;
/** Enemy speeds as multiples of PLAYER_SPEED. */
export const ENEMY_SLOW_FACTOR = 0.75;
export const ENEMY_FAST_FACTOR = 1.0;
