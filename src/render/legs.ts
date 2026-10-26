// Leg animation for the spiders. The renderer must not change the game state,
// so it remembers how far each spider has moved on screen in its own map. A
// spider object that the game replaces (a new round, a crash) simply starts a
// fresh entry, and the old one is forgotten with it.

import type { Px } from "../themes/theme";

/** How far the leg cycle turns while the spider crawls one body size; about 5.5 sizes per full cycle. */
const RADIANS_PER_BODY_SIZE = 1.15;

type Stride = { last: Px; phase: number };

export type LegAnimator = {
  /** Phase for the spider's legs after it got to `at`; size is its body size in pixels. */
  phase(spider: object, at: Px, size: number): number;
};

export function createLegAnimator(): LegAnimator {
  const strides = new WeakMap<object, Stride>();
  return {
    phase(spider, at, size) {
      const stride = strides.get(spider);
      if (!stride) {
        strides.set(spider, { last: at, phase: 0 });
        return 0;
      }
      const moved = Math.hypot(at.x - stride.last.x, at.y - stride.last.y);
      stride.phase += (moved / size) * RADIANS_PER_BODY_SIZE;
      stride.last = at;
      return stride.phase;
    },
  };
}
