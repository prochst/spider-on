// Wires the pure game logic to the browser: the fixed-step loop, the canvas,
// the menus and the keyboard.

import { FIXED_STEP } from "./game/config";
import { type Command, crash, createGame, debugEatAllFlies, dispatch, steer, update } from "./game/game";
import { planSteps } from "./game/fixedStep";
import { cancelEvent, confirmEvent } from "./game/screens";
import { type KeyCommand, listenToKeyboard } from "./input/keyboard";
import { drawScene } from "./render/scene";
import { createView, type View } from "./render/view";
import { createOverlay } from "./ui/overlay";
import "./ui/overlay.css";

function required<T>(value: T | null, what: string): T {
  if (value === null) throw new Error(`Missing ${what}`);
  return value;
}

const canvas = required(document.querySelector<HTMLCanvasElement>("#game"), "#game canvas");
const uiRoot = required(document.querySelector<HTMLElement>("#ui"), "#ui root");
const ctx = required(canvas.getContext("2d"), "Canvas 2D support");

// ?debug in the address enables shortcuts to reach the later screens
// quickly: K simulates a crash, C eats all flies and so clears the round.
const debug = new URLSearchParams(window.location.search).has("debug");

const game = createGame();
// Lets the browser console and automated checks look at the state while debugging.
if (debug) Object.assign(window, { spiderOn: game });
const overlay = createOverlay(uiRoot, send);

function send(command: Command): void {
  if (dispatch(game, command)) overlay.sync(game);
}

function onKey(key: KeyCommand): void {
  switch (key) {
    case "confirm":
    case "cancel": {
      const command = key === "confirm" ? confirmEvent(game.screen) : cancelEvent(game.screen);
      if (command) send(command);
      return;
    }
    case "in":
    case "out":
      steer(game, key);
      return;
    case "debugCrash":
      if (crash(game)) overlay.sync(game);
      return;
    case "debugClear":
      debugEatAllFlies(game);
      return;
  }
}

listenToKeyboard(
  {
    command: onKey,
    throttle: (held) => {
      game.throttle = held;
    },
  },
  debug,
);

// The spec asks for a pause whenever the player looks away.
window.addEventListener("blur", () => send({ type: "pause" }));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) send({ type: "pause" });
});

let view: View = createView(1, 1);

function resize(): void {
  // Sharp lines on HiDPI screens; above 2× the extra pixels cost more than they show.
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  view = createView(width, height);
}

window.addEventListener("resize", resize);
resize();

let lastTime: number | null = null;
let remainder = 0;

function frame(now: number): void {
  const frameTime = lastTime === null ? 0 : (now - lastTime) / 1000;
  lastTime = now;
  const plan = planSteps(remainder, frameTime);
  remainder = plan.remainder;
  for (let i = 0; i < plan.steps; i++) update(game, FIXED_STEP);

  // The crash animation ends on its own, so the menu may need to change after an update.
  overlay.sync(game);
  drawScene(ctx, view, game);
  requestAnimationFrame(frame);
}

overlay.sync(game);
requestAnimationFrame(frame);
