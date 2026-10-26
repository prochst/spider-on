// Recognises swipes and taps from the moves of one finger (spec chapter 11).
// Plain arithmetic without the DOM, so it is tested on its own; touch.ts feeds
// it the pointer events.

import { SWIPE_MIN_DISTANCE, TAP_MAX_DISTANCE, TAP_MAX_TIME } from "../game/config";

type Point = { x: number; y: number };

export type Gesture = {
  /** Where the finger touched down; a tap must stay close to it. */
  start: Point;
  startTime: number;
  /** Where the next swipe is measured from; moves on after each swipe. */
  origin: Point;
  /** The finger moved too far to be a tap. */
  moved: boolean;
};

export type Swipe = { dx: number; dy: number };

/** time is in seconds. */
export function beginGesture(at: Point, time: number): Gesture {
  return { start: at, startTime: time, origin: at, moved: false };
}

/**
 * Returns a swipe once the finger has travelled far enough from the origin.
 * The origin then moves to the finger, so a second stroke without lifting
 * the finger is a second swipe: during a climb it adds one more ring.
 */
export function moveGesture(gesture: Gesture, at: Point): Swipe | null {
  if (Math.hypot(at.x - gesture.start.x, at.y - gesture.start.y) > TAP_MAX_DISTANCE) gesture.moved = true;
  const dx = at.x - gesture.origin.x;
  const dy = at.y - gesture.origin.y;
  if (Math.hypot(dx, dy) < SWIPE_MIN_DISTANCE) return null;
  gesture.origin = at;
  return { dx, dy };
}

/** Whether the finger, lifted at `time`, made a tap. */
export function endGesture(gesture: Gesture, time: number): boolean {
  return !gesture.moved && time - gesture.startTime <= TAP_MAX_TIME;
}
