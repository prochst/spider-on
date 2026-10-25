// Tunable constants from docs/specifikace.md. Distances are in units of R
// (half the side of the square play area), times in seconds.

export const RING_COUNT = 5;
export const SPOKE_COUNT = 12;
/** Spoke indices where a spider may switch rings: right, bottom, left, top. */
export const GATE_SPOKES = [0, 3, 6, 9] as const;
export const INNER_RING_RADIUS = 0.28;
export const RING_SPACING = 0.16;
/** How far each ring segment sags toward the centre, as a fraction of its chord distance. */
export const SEGMENT_SAG = 0.06;
