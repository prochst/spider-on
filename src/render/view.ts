// Maps game units (R, half the side of the square play area) to canvas pixels
// and places the touch controls beside the web.

import { WEB_EDGE } from "./layout";

export type Circle = { x: number; y: number; r: number };
/** A square by its centre and half its side. */
export type Square = { x: number; y: number; half: number };

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

export function createView(width: number, height: number, touchControls = false): View {
  const sideSpace = touchControls ? Math.min(height * CONTROL_SPACE, MAX_CONTROL_SPACE) : 0;
  // On a phone the height limits the web; on a squarer tablet the controls do.
  const unit = Math.max(0, Math.min(height / 2, width / 2 - sideSpace) * PLAY_AREA_FILL);
  const view: View = { width, height, cx: width / 2, cy: height / 2, unit, controls: null };
  if (!touchControls) return view;

  const r = sideSpace * THROTTLE_SIZE;
  // Halfway between the screen edge and the web, so on a phone, where the web
  // fills the height and leaves wide strips, the controls do not hug the edge.
  const inset = (width / 2 - unit * WEB_EDGE) / 2;
  const y = height / 2;
  view.controls = {
    throttle: { x: inset, y, r },
    pad: { x: width - inset, y, half: r * PAD_SIZE },
  };
  return view;
}
