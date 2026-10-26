// Maps game units (R, half the side of the square play area) to canvas pixels
// and places the touch controls beside the web.

export type Circle = { x: number; y: number; r: number };

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
  controls: { pad: Circle; throttle: Circle } | null;
};

// A thin margin keeps the glow of the outer ring and the HUD inside the screen.
const PLAY_AREA_FILL = 0.9;
/** Room for the controls on each side of the web, as a share of the screen height... */
const CONTROL_SPACE = 0.34;
/** ...but no more than this in CSS pixels, so a tablet keeps thumb-sized controls and a large web. */
const MAX_CONTROL_SPACE = 190;
/** The controls sit a little below the middle, where the thumbs rest. */
const CONTROL_HEIGHT = 0.6;

export function createView(width: number, height: number, touchControls = false): View {
  const sideSpace = touchControls ? Math.min(height * CONTROL_SPACE, MAX_CONTROL_SPACE) : 0;
  // On a phone the height limits the web; on a squarer tablet the controls do.
  const unit = Math.max(0, Math.min(height / 2, width / 2 - sideSpace) * PLAY_AREA_FILL);
  const view: View = { width, height, cx: width / 2, cy: height / 2, unit, controls: null };
  if (!touchControls) return view;

  const r = sideSpace * 0.36;
  const y = height * CONTROL_HEIGHT;
  view.controls = {
    throttle: { x: sideSpace / 2, y, r },
    pad: { x: width - sideSpace / 2, y, r },
  };
  return view;
}
