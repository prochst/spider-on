import { describe, expect, it } from "vitest";
import { WEB_EDGE } from "./layout";
import { createView, type Insets } from "./view";

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

  // An iPhone held sideways: the notch side and the home bar.
  const NOTCH: Insets = { top: 0, right: 47, bottom: 21, left: 47 };

  it("keeps the web and the touch controls inside the safe area", () => {
    const view = createView(844, 390, true, { safe: NOTCH, cornerButton: 0 });
    const { pad, throttle } = view.controls!;
    expect(view.cy + view.unit * WEB_EDGE).toBeLessThanOrEqual(390 - NOTCH.bottom);
    expect(throttle.x - throttle.r).toBeGreaterThanOrEqual(NOTCH.left);
    expect(pad.x + pad.half).toBeLessThanOrEqual(844 - NOTCH.right);
    expect(view.cx).toBe(422);
    expect(view.cy).toBeCloseTo((390 - NOTCH.bottom) / 2);
  });

  it("gives the HUD the safe edges and leaves the corner button free", () => {
    const view = createView(844, 390, true, { safe: NOTCH, cornerButton: 68 });
    expect(view.hud).toEqual({ left: 47, top: 0, right: 844 - 47 - 68 });
  });

  it("uses the whole screen when nothing covers it", () => {
    expect(createView(1280, 720).hud).toEqual({ left: 0, top: 0, right: 1280 });
  });
});
