import { describe, expect, it } from "vitest";
import { FIXED_STEP, MAX_FRAME_TIME } from "./config";
import { planSteps } from "./fixedStep";

function runFrames(frameTime: number, frames: number): number {
  let remainder = 0;
  let total = 0;
  for (let i = 0; i < frames; i++) {
    const plan = planSteps(remainder, frameTime);
    remainder = plan.remainder;
    total += plan.steps;
  }
  return total;
}

describe("planSteps", () => {
  it("runs 120 steps per second regardless of the frame rate", () => {
    expect(runFrames(1 / 60, 60)).toBe(120);
    expect(runFrames(1 / 120, 120)).toBe(120);
    expect(runFrames(1 / 144, 144)).toBe(120);
    expect(runFrames(1 / 30, 30)).toBe(120);
  });

  it("runs exactly two steps on every 60 Hz frame", () => {
    let remainder = 0;
    for (let i = 0; i < 600; i++) {
      const plan = planSteps(remainder, 1 / 60);
      expect(plan.steps).toBe(2);
      remainder = plan.remainder;
    }
  });

  it("carries a partial step over to the next frame", () => {
    const first = planSteps(0, FIXED_STEP * 0.6);
    expect(first.steps).toBe(0);
    const second = planSteps(first.remainder, FIXED_STEP * 0.6);
    expect(second.steps).toBe(1);
    expect(second.remainder).toBeCloseTo(FIXED_STEP * 0.2);
  });

  it("caps a long stall instead of catching up on all of it", () => {
    const plan = planSteps(0, 10);
    expect(plan.steps).toBe(Math.round(MAX_FRAME_TIME / FIXED_STEP));
  });

  it("ignores negative frame times from clock adjustments", () => {
    expect(planSteps(0, -1).steps).toBe(0);
  });
});
