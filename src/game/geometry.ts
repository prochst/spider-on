import { INNER_RING_RADIUS, OUTER_RING_RADIUS, SEGMENT_SAG, SPOKE_COUNT } from "./config";

export type Point = { x: number; y: number };

const TAU = Math.PI * 2;
export const SPOKE_STEP = TAU / SPOKE_COUNT;

/** Normalises an angle to the range [0, 2π). */
export function normalizeAngle(angle: number): number {
  return ((angle % TAU) + TAU) % TAU;
}

/** Rings are spread evenly between the fixed inner and outer radius, so a smaller web has wider lanes. */
export function ringRadius(ring: number, ringCount: number): number {
  const spacing = (OUTER_RING_RADIUS - INNER_RING_RADIUS) / (ringCount - 1);
  return INNER_RING_RADIUS + spacing * ring;
}

/**
 * Point on a ring at the given angle. Each segment between two spokes is a
 * quadratic curve sagging toward the centre, so the web reads as a polygon
 * of silk rather than a perfect circle.
 */
export function ringPoint(ring: number, ringCount: number, angle: number): Point {
  const r = ringRadius(ring, ringCount);
  const a = normalizeAngle(angle);
  const segment = Math.floor(a / SPOKE_STEP);
  const t = (a - segment * SPOKE_STEP) / SPOKE_STEP;
  const a0 = segment * SPOKE_STEP;
  const a1 = a0 + SPOKE_STEP;
  const controlRadius = r * Math.cos(SPOKE_STEP / 2) * (1 - SEGMENT_SAG);
  const am = a0 + SPOKE_STEP / 2;
  const u = 1 - t;
  return {
    x: u * u * r * Math.cos(a0) + 2 * u * t * controlRadius * Math.cos(am) + t * t * r * Math.cos(a1),
    y: u * u * r * Math.sin(a0) + 2 * u * t * controlRadius * Math.sin(am) + t * t * r * Math.sin(a1),
  };
}
