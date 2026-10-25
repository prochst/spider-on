import { FIXED_STEP, MAX_FRAME_TIME } from "./config";

export type StepPlan = {
  /** How many fixed simulation steps to run this frame. */
  steps: number;
  /** Time left over for the next frame, always below one step. */
  remainder: number;
};

// Accumulated floating point error can leave the remainder a hair below a
// whole step; without this tolerance 60 Hz frames would sometimes run one
// step and sometimes three instead of steady pairs.
const EPSILON = 1e-9;

/**
 * Splits real elapsed time into whole fixed steps. The caller keeps the
 * remainder and passes it back on the next frame.
 */
export function planSteps(
  remainder: number,
  frameTime: number,
  step: number = FIXED_STEP,
  maxFrameTime: number = MAX_FRAME_TIME,
): StepPlan {
  let time = remainder + Math.min(Math.max(frameTime, 0), maxFrameTime);
  let steps = 0;
  while (time + EPSILON >= step) {
    time -= step;
    steps++;
  }
  return { steps, remainder: Math.max(time, 0) };
}
