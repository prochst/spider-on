import { describe, expect, it } from "vitest";
import { GATE_SPOKES, SPOKE_COUNT } from "../game/config";
import { ringRadius } from "../game/geometry";
import { toScreen, webLayout } from "./layout";
import { createView } from "./view";

const view = createView(800, 600);

describe("webLayout", () => {
  it("has a closed polyline for every ring and every spoke", () => {
    for (const rings of [3, 4, 5]) {
      const web = webLayout(view, rings);
      expect(web.rings).toHaveLength(rings);
      for (const ring of web.rings) expect(ring[0]?.x).toBeCloseTo(ring[ring.length - 1]?.x ?? NaN);
      expect(web.spokes).toHaveLength(SPOKE_COUNT);
      expect(web.spokes.filter((s) => s.isGate)).toHaveLength(GATE_SPOKES.length);
    }
  });

  it("runs the gate spokes exactly from the inner to the outer ring", () => {
    const web = webLayout(view, 4);
    const right = web.spokes[0]!;
    expect(right.isGate).toBe(true);
    expect(right.from.x - view.cx).toBeCloseTo(ringRadius(0, 4) * view.unit);
    expect(right.to.x - view.cx).toBeCloseTo(ringRadius(3, 4) * view.unit);
  });
});

describe("toScreen", () => {
  it("puts the centre of the web in the middle and keeps y pointing down", () => {
    expect(toScreen(view, { x: 0, y: 0 })).toEqual({ x: 400, y: 300 });
    expect(toScreen(view, { x: 0, y: 1 }).y).toBeGreaterThan(300);
  });
});
