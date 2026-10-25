import { describe, expect, it } from "vitest";
import { MAX_RING_COUNT, MIN_RING_COUNT, SPOKE_COUNT } from "./config";
import { normalizeAngle, ringPoint, ringRadius, SPOKE_STEP } from "./geometry";

describe("normalizeAngle", () => {
  it("wraps negative and large angles into [0, 2π)", () => {
    expect(normalizeAngle(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2);
    expect(normalizeAngle(5 * Math.PI)).toBeCloseTo(Math.PI);
    expect(normalizeAngle(0)).toBe(0);
  });
});

describe("ringRadius", () => {
  it("keeps the inner ring at 0.28 R and the outer ring at 0.92 R for every web size", () => {
    for (let count = MIN_RING_COUNT; count <= MAX_RING_COUNT; count++) {
      expect(ringRadius(0, count)).toBeCloseTo(0.28);
      expect(ringRadius(count - 1, count)).toBeCloseTo(0.92);
    }
  });

  it("gives a smaller web wider lanes", () => {
    expect(ringRadius(1, 3)).toBeCloseTo(0.6);
    expect(ringRadius(1, 5)).toBeCloseTo(0.44);
  });
});

describe("ringPoint", () => {
  it("lies exactly on the ring radius at every spoke", () => {
    for (let spoke = 0; spoke < SPOKE_COUNT; spoke++) {
      const p = ringPoint(2, 5, spoke * SPOKE_STEP);
      expect(Math.hypot(p.x, p.y)).toBeCloseTo(ringRadius(2, 5));
    }
  });

  it("sags toward the centre between spokes", () => {
    const p = ringPoint(2, 5, SPOKE_STEP / 2);
    expect(Math.hypot(p.x, p.y)).toBeLessThan(ringRadius(2, 5));
  });

  it("uses screen orientation: 90° points down", () => {
    const p = ringPoint(4, 5, Math.PI / 2);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeGreaterThan(0);
  });
});
