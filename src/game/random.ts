// Seeded random numbers (spec chapter 15): the same seed gives the same game,
// so tests can replay any situation. The browser picks the seed; the logic
// never calls Math.random().

/** Returns numbers in [0, 1), like Math.random(). */
export type Random = () => number;

/**
 * Mulberry32: a tiny, well known generator with 32 bits of state. Plenty
 * for a game and easy to read, unlike cryptographic generators.
 */
export function createRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A number in [min, max). */
export function randomBetween(random: Random, min: number, max: number): number {
  return min + (max - min) * random();
}

/** A random element, or undefined for an empty list. */
export function pickRandom<T>(random: Random, items: readonly T[]): T | undefined {
  return items[Math.floor(random() * items.length)];
}
