import { describe, expect, it } from "vitest";
import { WEB_EDGE } from "./layout";
import { createView } from "./view";

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
      expect(pad.x - pad.half).toBeGreaterThan(view.cx + view.unit * WEB_EDGE);
      expect(throttle.x + throttle.r).toBeLessThan(view.cx - view.unit * WEB_EDGE);
      expect(pad.x + pad.half).toBeLessThanOrEqual(width);
      expect(throttle.x - throttle.r).toBeGreaterThanOrEqual(0);
      expect(pad.y + pad.half).toBeLessThanOrEqual(height);
    }
  });

  it("centres the controls between the screen edge and the web, halfway up", () => {
    const view = createView(844, 390, true);
    const { pad, throttle } = view.controls!;
    const webLeft = view.cx - view.unit * WEB_EDGE;
    const webRight = view.cx + view.unit * WEB_EDGE;
    expect(throttle.x).toBeCloseTo(webLeft / 2);
    expect(pad.x).toBeCloseTo((webRight + 844) / 2);
    expect(throttle.y).toBe(195);
    expect(pad.y).toBe(195);
    expect(pad.half).toBeGreaterThan(throttle.r);
  });
});
