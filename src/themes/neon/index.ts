// Neon, the default theme (spec chapter 14): glowing vector lines on a dark
// background, drawn entirely in code. The look follows the style preview
// the user chose in phase 1.

import type { Theme } from "../theme";
import { drawBonusNotice, drawCrash, drawHud, FONT_FAMILY } from "./effects";
import { drawBonusPackage, drawFly } from "./items";
import { drawSpider } from "./spider";
import { drawBackground, drawWeb } from "./web";

export const neon: Theme = {
  id: "neon",
  name: "Neon",
  fontFamily: FONT_FAMILY,
  menu: {
    text: "#c9f6ff",
    panel: "rgba(7, 6, 15, 0.82)",
    border: "rgba(120, 235, 255, 0.5)",
    accent: "#ff6ad5",
    glow: "#4fe3ff",
  },
  drawBackground,
  drawWeb,
  drawFly,
  drawBonusPackage,
  drawBonusNotice,
  drawSpider,
  drawCrash,
  drawHud,
};
