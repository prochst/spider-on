import { describe, expect, it } from "vitest";
import { MAX_LIVES } from "./config";
import { addPoints } from "./scoring";

describe("addPoints", () => {
  it("adds points", () => {
    const state = { score: 120, lives: 3 };
    addPoints(state, 10);
    expect(state).toEqual({ score: 130, lives: 3 });
  });

  it("gives an extra life at 5 000 and then every 10 000", () => {
    const state = { score: 4990, lives: 2 };
    addPoints(state, 10);
    expect(state.lives).toBe(3);
    addPoints(state, 9990);
    expect(state.lives).toBe(3);
    addPoints(state, 10);
    expect(state.lives).toBe(4);
    addPoints(state, 10000);
    expect(state.lives).toBe(5);
  });

  it("counts every threshold a big bonus jumps over", () => {
    const state = { score: 4000, lives: 1 };
    addPoints(state, 12000);
    expect(state.lives).toBe(3);
  });

  it("never goes above the maximum", () => {
    const state = { score: 4990, lives: MAX_LIVES };
    addPoints(state, 10);
    expect(state.lives).toBe(MAX_LIVES);
  });
});
