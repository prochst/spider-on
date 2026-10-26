import { describe, expect, it } from "vitest";
import { createView } from "./view";

/** Distance from the centre to the tip of the plain spokes, the widest part of the web. */
const WEB_EDGE = 1.02;

describe("createView", () => {
  it("fills the height on a desktop without touch controls", () => {
    const view = createView(1280, 720);
    expect(view.unit).toBeCloseTo(360 * 0.9);
    expect(view.controls).toBeNull();
  });

  it("keeps the touch controls clear of the web on a phone and on a tablet", () => {
    for (const [width, height] of [
      [844, 390],
      [1024, 768],
      [1366, 1024],
    ] as const) {
      const view = createView(width, height, true);
      const { pad, throttle } = view.controls!;
      expect(pad.x - pad.r).toBeGreaterThan(view.cx + view.unit * WEB_EDGE);
      expect(throttle.x + throttle.r).toBeLessThan(view.cx - view.unit * WEB_EDGE);
      expect(pad.x + pad.r).toBeLessThanOrEqual(width);
      expect(throttle.x - throttle.r).toBeGreaterThanOrEqual(0);
    }
  });
});
