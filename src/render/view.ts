// Maps game units (R, half the side of the square play area) to canvas pixels
// and places the touch controls beside the web, all inside the safe area: the
// part of the screen a notch, rounded corners or the home bar do not cover.

import { WEB_EDGE } from "./layout";

export type Circle = { x: number; y: number; r: number };
/** A square by its centre and half its side. */
export type Square = { x: number; y: number; half: number };
/** Distances from the screen edges in CSS pixels. */
export type Insets = { top: number; right: number; bottom: number; left: number };

export const NO_INSETS: Insets = { top: 0, right: 0, bottom: 0, left: 0 };

export type View = {
  /** Canvas size in CSS pixels. */
  width: number;
  height: number;
  /** Centre of the web in CSS pixels. */
  cx: number;
  cy: number;
  /** Pixels per unit R. */
  unit: number;
  /** Where the touch controls are drawn; null without touch controls. */
  controls: { pad: Square; throttle: Circle } | null;
  /**
   * Edges the HUD texts stay inside: the safe area, and on the right also
   * clear of the menu button in the corner (pause or full screen).
   */
  hud: { left: number; top: number; right: number };
};

export type ScreenFrame = {
  /** The part of the screen hidden by a notch, rounded corners or the home bar. */
  safe: Insets;
  /** Width the HTML button in the top right corner takes, with its gap. */
  cornerButton: number;
};

// A thin margin keeps the glow of the outer ring and the HUD inside the screen.
const PLAY_AREA_FILL = 0.9;
/** Room for the controls on each side of the web, as a share of the screen height... */
const CONTROL_SPACE = 0.34;
/** ...but no more than this in CSS pixels, so a tablet keeps thumb-sized controls and a large web. */
const MAX_CONTROL_SPACE = 190;
/** Radius of the throttle button, as a share of the side space. */
const THROTTLE_SIZE = 0.36;
/** The touchpad is a little bigger than the throttle, like a laptop touchpad next to a button. */
const PAD_SIZE = 1.25;

export function createView(
  width: number,
  height: number,
  touchControls = false,
  frame: ScreenFrame = { safe: NO_INSETS, cornerButton: 0 },
): View {
  const { safe } = frame;
  const safeWidth = Math.max(0, width - safe.left - safe.right);
  const safeHeight = Math.max(0, height - safe.top - safe.bottom);
  const sideSpace = touchControls ? Math.min(safeHeight * CONTROL_SPACE, MAX_CONTROL_SPACE) : 0;
  // On a phone the height limits the web; on a squarer tablet the controls do.
  const unit = Math.max(0, Math.min(safeHeight / 2, safeWidth / 2 - sideSpace) * PLAY_AREA_FILL);
  const cx = safe.left + safeWidth / 2;
  const cy = safe.top + safeHeight / 2;
  const hud = { left: safe.left, top: safe.top, right: width - safe.right - frame.cornerButton };
  const view: View = { width, height, cx, cy, unit, controls: null, hud };
  if (!touchControls) return view;

  const r = sideSpace * THROTTLE_SIZE;
  // Halfway between the safe edge and the web, so on a phone, where the web
  // fills the height and leaves wide strips, the controls do not hug the edge.
  const inset = (safeWidth / 2 - unit * WEB_EDGE) / 2;
  view.controls = {
    throttle: { x: safe.left + inset, y: cy, r },
    pad: { x: width - safe.right - inset, y: cy, half: r * PAD_SIZE },
  };
  return view;
}
