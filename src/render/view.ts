// Maps game units (R, half the side of the square play area) to canvas pixels.

export type View = {
  /** Canvas size in CSS pixels. */
  width: number;
  height: number;
  /** Centre of the web in CSS pixels. */
  cx: number;
  cy: number;
  /** Pixels per unit R. */
  unit: number;
};

// A thin margin keeps the glow of the outer ring and the HUD inside the screen.
const PLAY_AREA_FILL = 0.9;

export function createView(width: number, height: number): View {
  return {
    width,
    height,
    cx: width / 2,
    cy: height / 2,
    unit: (Math.min(width, height) / 2) * PLAY_AREA_FILL,
  };
}
