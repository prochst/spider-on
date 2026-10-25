import { describe, expect, it } from "vitest";
import { RING_COUNT, SPOKE_COUNT } from "./config";
import { normalizeAngle, ringPoint, ringRadius, SPOKE_STEP } from "./geometry";

describe("normalizeAngle", () => {
  it("wraps negative and large angles into [0, 2π)", () => {
    expect(normalizeAngle(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2);
    expect(normalizeAngle(5 * Math.PI)).toBeCloseTo(Math.PI);
    expect(normalizeAngle(0)).toBe(0);
  });
});

describe("ringRadius", () => {
  it("places the outer ring at 0.92 R as the spec requires", () => {
    expect(ringRadius(RING_COUNT - 1)).toBeCloseTo(0.92);
  });
});

describe("ringPoint", () => {
  it("lies exactly on the ring radius at every spoke", () => {
    for (let spoke = 0; spoke < SPOKE_COUNT; spoke++) {
      const p = ringPoint(2, spoke * SPOKE_STEP);
      expect(Math.hypot(p.x, p.y)).toBeCloseTo(ringRadius(2));
    }
  });

  it("sags toward the centre between spokes", () => {
    const p = ringPoint(2, SPOKE_STEP / 2);
    expect(Math.hypot(p.x, p.y)).toBeLessThan(ringRadius(2));
  });

  it("uses screen orientation: 90° points down", () => {
    const p = ringPoint(4, Math.PI / 2);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeGreaterThan(0);
  });
});
