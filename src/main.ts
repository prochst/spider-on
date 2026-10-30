// Wires the pure game logic to the browser: the fixed-step loop, the canvas,
// the menus and the keyboard.

import { createSound } from "./audio/sound";
import { FIXED_STEP } from "./game/config";
import {
  type Command,
  crash,
  createGame,
  debugEatAllFlies,
  dispatch,
  steerToward,
  update,
} from "./game/game";
import { addScore } from "./game/scores";
import type { Settings } from "./game/settings";
import { planSteps } from "./game/fixedStep";
import { cancelEvent, confirmEvent } from "./game/screens";
import { type KeyCommand, listenToKeyboard } from "./input/keyboard";
import { listenToTouch } from "./input/touch";
import { createLegAnimator } from "./render/legs";
import { drawScene, type Renderer } from "./render/scene";
import { createView, type ScreenFrame, type View } from "./render/view";
import { loadScores, loadSettings, saveScores, saveSettings, today } from "./storage/storage";
import { neon } from "./themes/neon";
import type { Theme } from "./themes/theme";
import { registerServiceWorker } from "./pwa/serviceWorker";
import { applyMenuTheme, createOverlay, type MenuData } from "./ui/overlay";
import "./assets/fonts/chakra-petch/chakra-petch.css";
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

// The logic only ever uses this seed. With ?debug&seed=123 a game can be replayed exactly.
const params = new URLSearchParams(window.location.search);
const seed = debug && params.has("seed") ? Number(params.get("seed")) : Math.floor(Math.random() * 2 ** 32);
const game = createGame(seed);
// Lets the browser console and automated checks look at the state while debugging.
if (debug) {
  Object.assign(window, { spiderOn: game });
  // The layout changes with every resize, so automated checks read the current one.
  Object.defineProperty(window, "spiderOnView", { get: () => view });
}
// The throttle is held while a key or the touch button holds it.
const throttle = { keys: false, touch: false };
const updateThrottle = () => {
  game.throttle = throttle.keys || throttle.touch;
};

// Touch controls show on touch-first devices, or from the first touch on any other.
const coarsePointer = window.matchMedia("(pointer: coarse)");
let touchControls = coarsePointer.matches;
const touch = listenToTouch(canvas, {
  swipe: ({ dx, dy }) => steerToward(game, dx, dy),
  // A tap starts the round when the game waits for it; anywhere else it does nothing.
  tap: () => {
    if (game.screen.name === "ready") send({ type: "start" });
  },
  throttle: (held) => {
    throttle.touch = held;
    updateThrottle();
  },
  firstTouch: () => {
    touchControls = true;
    uiRoot.classList.add("touch");
    resize();
  },
});

uiRoot.classList.toggle("touch", touchControls);

// Čmáranice joins this list later (spec chapter 14).
const THEMES: readonly Theme[] = [neon];
const themeById = (id: string) => THEMES.find((theme) => theme.id === id) ?? neon;

const menu: MenuData = {
  settings: loadSettings(THEMES.map((theme) => theme.id)),
  scores: loadScores(),
  lastRank: null,
  themes: THEMES.map(({ id, name }) => ({ id, name })),
  update: null,
};
game.difficulty = menu.settings.difficulty;
const sound = createSound(menu.settings.sound);
// Browsers allow audio only after a gesture; capture sees it before any handler can stop it.
for (const type of ["pointerdown", "keydown"]) window.addEventListener(type, () => sound.unlock(), { capture: true });

const renderer: Renderer = { theme: themeById(menu.settings.themeId), legs: createLegAnimator(), touch };
useTheme(renderer.theme);

function useTheme(theme: Theme): void {
  renderer.theme = theme;
  applyMenuTheme(uiRoot, theme);
  // The canvas does not ask for web fonts by itself, so load the HUD weight up
  // front; the Czech letters make the browser fetch the latin-ext part as well.
  void document.fonts.load(`700 16px ${theme.fontFamily}`, "SKÓRE ŽIVOTY ĚŠČŘŮ");
}

function changeSettings(change: Partial<Settings>): void {
  menu.settings = { ...menu.settings, ...change };
  saveSettings(menu.settings);
  sound.enabled = menu.settings.sound;
  game.difficulty = menu.settings.difficulty;
  if (change.themeId) useTheme(themeById(change.themeId));
}

const overlay = createOverlay(uiRoot, () => menu, { command: send, settings: changeSettings });
registerServiceWorker((apply) => {
  menu.update = apply;
  // Only the title screen offers it; any other menu is left alone, so a name being typed is not lost.
  if (game.screen.name === "title") overlay.refresh(game);
});

/** Plays the sounds of the last steps and records a finished game in the score table. */
function handleEvents(): void {
  // Several flies in one frame still make one sound.
  for (const event of new Set(game.events)) {
    sound.play(event);
    if (event === "gameOver") recordGame();
  }
  game.events.length = 0;
}

function recordGame(): void {
  const { score, difficulty, round } = game.session;
  const entry = { name: menu.settings.name, score, difficulty, round, date: today() };
  const { table, rank } = addScore(menu.scores, entry);
  menu.scores = table;
  menu.lastRank = rank;
  if (rank !== null) saveScores(table);
}

function send(command: Command): void {
  if (dispatch(game, command)) overlay.sync(game);
}

// Screen directions with y pointing down, as on the canvas.
const ARROW_DIRECTIONS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] } as const;

function onKey(key: KeyCommand): void {
  switch (key) {
    case "confirm":
    case "cancel": {
      const command = key === "confirm" ? confirmEvent(game.screen) : cancelEvent(game.screen);
      if (command) send(command);
      return;
    }
    case "up":
    case "down":
    case "left":
    case "right": {
      const [dx, dy] = ARROW_DIRECTIONS[key];
      steerToward(game, dx, dy);
      return;
    }
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
      throttle.keys = held;
      updateThrottle();
    },
  },
  debug,
);

// The spec asks for a pause whenever the player looks away.
window.addEventListener("blur", () => send({ type: "pause" }));
document.addEventListener("visibilitychange", () => {
  if (document.hidden) send({ type: "pause" });
});
// On a touch device the game runs in landscape; overlay.css shows the hint to turn it.
const portraitTouch = window.matchMedia("(orientation: portrait) and (pointer: coarse)");
portraitTouch.addEventListener("change", () => {
  if (portraitTouch.matches) send({ type: "pause" });
});

let view: View = createView(1, 1);

// The safe area exists only in CSS (env()), so an invisible element styled
// from it tells the canvas where the notch and the corner button are.
const layoutProbe = document.createElement("div");
layoutProbe.className = "layout-probe";
document.body.append(layoutProbe);

function readScreenFrame(): ScreenFrame {
  const box = layoutProbe.getBoundingClientRect();
  const style = getComputedStyle(layoutProbe);
  return {
    safe: { top: box.top, left: box.left, right: window.innerWidth - box.right, bottom: window.innerHeight - box.bottom },
    cornerButton: parseFloat(style.paddingRight) || 0,
  };
}

function resize(): void {
  // Sharp lines on HiDPI screens; above 2× the extra pixels cost more than they show.
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  view = createView(width, height, touchControls, readScreenFrame());
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
  // The debug crash and other commands also add events, so they are handled once per frame.
  handleEvents();

  // The crash animation ends on its own, so the menu may need to change after an update.
  overlay.sync(game);
  drawScene(ctx, view, game, renderer, now / 1000);
  requestAnimationFrame(frame);
}

overlay.sync(game);
requestAnimationFrame(frame);
