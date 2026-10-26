import { describe, expect, it } from "vitest";
import { SWIPE_MIN_DISTANCE, TAP_MAX_DISTANCE, TAP_MAX_TIME } from "../game/config";
import { beginGesture, endGesture, moveGesture } from "./gesture";

describe("gesture", () => {
  it("reports a swipe once the finger travels far enough", () => {
    const gesture = beginGesture({ x: 100, y: 100 }, 0);
    expect(moveGesture(gesture, { x: 100, y: 100 - SWIPE_MIN_DISTANCE / 2 })).toBeNull();
    expect(moveGesture(gesture, { x: 102, y: 100 - SWIPE_MIN_DISTANCE })).toEqual({ dx: 2, dy: -SWIPE_MIN_DISTANCE });
  });

  it("measures the next swipe from where the last one ended", () => {
    const gesture = beginGesture({ x: 0, y: 0 }, 0);
    moveGesture(gesture, { x: SWIPE_MIN_DISTANCE, y: 0 });
    expect(moveGesture(gesture, { x: SWIPE_MIN_DISTANCE * 1.5, y: 0 })).toBeNull();
    expect(moveGesture(gesture, { x: SWIPE_MIN_DISTANCE * 2, y: 0 })).toEqual({ dx: SWIPE_MIN_DISTANCE, dy: 0 });
  });

  it("counts a short touch that stays in place as a tap", () => {
    const gesture = beginGesture({ x: 50, y: 50 }, 1);
    moveGesture(gesture, { x: 50 + TAP_MAX_DISTANCE / 2, y: 50 });
    expect(endGesture(gesture, 1 + TAP_MAX_TIME / 2)).toBe(true);
  });

  it("does not count a long press or a moved finger as a tap", () => {
    const held = beginGesture({ x: 0, y: 0 }, 0);
    expect(endGesture(held, TAP_MAX_TIME * 2)).toBe(false);

    const moved = beginGesture({ x: 0, y: 0 }, 0);
    moveGesture(moved, { x: TAP_MAX_DISTANCE + 1, y: 0 });
    moveGesture(moved, { x: 0, y: 0 });
    expect(endGesture(moved, 0.1)).toBe(false);
  });
});
