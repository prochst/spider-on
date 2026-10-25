import { describe, expect, it } from "vitest";
import { createRandom, pickRandom, randomBetween } from "./random";

describe("createRandom", () => {
  it("repeats the same sequence for the same seed", () => {
    const a = createRandom(42);
    const b = createRandom(42);
    for (let i = 0; i < 100; i++) expect(a()).toBe(b());
  });

  it("gives different sequences for different seeds", () => {
    expect(createRandom(1)()).not.toBe(createRandom(2)());
  });

  it("stays in [0, 1) and spreads evenly", () => {
    const random = createRandom(7);
    const buckets = new Array<number>(10).fill(0);
    const n = 100_000;
    for (let i = 0; i < n; i++) {
      const x = random();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
      buckets[Math.floor(x * 10)]! += 1;
    }
    for (const count of buckets) expect(count / n).toBeCloseTo(0.1, 1);
  });
});

describe("helpers", () => {
  it("randomBetween stays in the range", () => {
    const random = createRandom(3);
    for (let i = 0; i < 1000; i++) {
      const x = randomBetween(random, 5, 20);
      expect(x).toBeGreaterThanOrEqual(5);
      expect(x).toBeLessThan(20);
    }
  });

  it("pickRandom returns undefined for an empty list", () => {
    expect(pickRandom(createRandom(1), [])).toBeUndefined();
    expect(pickRandom(createRandom(1), ["a"])).toBe("a");
  });
});
