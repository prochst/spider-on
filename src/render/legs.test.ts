import { describe, expect, it } from "vitest";
import { createLegAnimator } from "./legs";

describe("createLegAnimator", () => {
  it("moves the legs only while the spider moves", () => {
    const legs = createLegAnimator();
    const spider = {};
    legs.phase(spider, { x: 0, y: 0 }, 10);
    const walked = legs.phase(spider, { x: 10, y: 0 }, 10);
    expect(walked).toBeGreaterThan(0);
    expect(legs.phase(spider, { x: 10, y: 0 }, 10)).toBe(walked);
  });

  it("keeps each spider's stride separately", () => {
    const legs = createLegAnimator();
    const a = {};
    const b = {};
    legs.phase(a, { x: 0, y: 0 }, 10);
    legs.phase(a, { x: 20, y: 0 }, 10);
    expect(legs.phase(b, { x: 20, y: 0 }, 10)).toBe(0);
  });
});
