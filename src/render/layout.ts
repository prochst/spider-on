// Turns positions in units of R into canvas pixels for the themes. Everything
// here is plain arithmetic, so it is tested without a canvas.

import { GATE_SPOKES, SPOKE_COUNT } from "../game/config";
import { type Point, ringPoint, ringRadius, SPOKE_STEP } from "../game/geometry";
import type { Px, WebLayout } from "../themes/theme";
import type { View } from "./view";

// Enough points that the sagging ring segments look smooth on a large screen.
const POINTS_PER_RING = 240;
/** Plain spokes run from near the centre to just past the outer ring. */
const SPOKE_INNER = 0.06;
const SPOKE_OUTER = 1.02;
/** How far from the centre the web reaches, in units of R: the tips of the plain spokes. */
export const WEB_EDGE = SPOKE_OUTER;

export function toScreen(view: View, p: Point): Px {
  return { x: view.cx + p.x * view.unit, y: view.cy + p.y * view.unit };
}

function polar(view: View, angle: number, radius: number): Px {
  return toScreen(view, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
}

/**
 * Gate spokes span exactly from the innermost to the outermost ring, because
 * that is where the spiders can climb; the plain spokes only hold the web.
 */
export function webLayout(view: View, ringCount: number): WebLayout {
  const rings = Array.from({ length: ringCount }, (_, ring) =>
    Array.from({ length: POINTS_PER_RING + 1 }, (_, i) =>
      toScreen(view, ringPoint(ring, ringCount, (i / POINTS_PER_RING) * Math.PI * 2)),
    ),
  );
  const gates: readonly number[] = GATE_SPOKES;
  const spokes = Array.from({ length: SPOKE_COUNT }, (_, spoke) => {
    const angle = spoke * SPOKE_STEP;
    const isGate = gates.includes(spoke);
    const from = isGate ? ringRadius(0, ringCount) : SPOKE_INNER;
    const to = isGate ? ringRadius(ringCount - 1, ringCount) : SPOKE_OUTER;
    return { from: polar(view, angle, from), to: polar(view, angle, to), isGate };
  });
  return { rings, spokes };
}
