// Screen flow from docs/specifikace.md, chapter 12. Each screen is a plain
// value and every change goes through transition(), so the whole flow can be
// tested without a browser.

import { CRASH_DURATION } from "./config";

export type TitleScreen = { name: "title" };
export type ScoresScreen = { name: "scores" };
/** The web is shown and the game waits for the player to start the round. */
export type ReadyScreen = { name: "ready" };
export type PlayingScreen = { name: "playing" };
/** Crash animation; the game decides at the crash whether this was the last life. */
export type CrashScreen = { name: "crash"; timeLeft: number; lastLife: boolean };
export type RoundCompleteScreen = { name: "roundComplete" };
export type GameOverScreen = { name: "gameOver" };
export type PausedScreen = { name: "paused"; resume: ReadyScreen | PlayingScreen | CrashScreen };
/** Settings open from the title or from the pause menu and return there. */
export type SettingsScreen = { name: "settings"; back: TitleScreen | PausedScreen };

export type Screen =
  | TitleScreen
  | SettingsScreen
  | ScoresScreen
  | ReadyScreen
  | PlayingScreen
  | CrashScreen
  | RoundCompleteScreen
  | PausedScreen
  | GameOverScreen;

export type ScreenName = Screen["name"];

export type ScreenEvent =
  /** Start a new game: Hrát on the title, Hrát znovu after game over. */
  | { type: "play" }
  | { type: "openScores" }
  | { type: "openSettings" }
  /** Leave the scores or settings screen. */
  | { type: "back" }
  /** The player starts the round from the ready screen. */
  | { type: "start" }
  | { type: "pause" }
  | { type: "resume" }
  /** Zpět do menu. */
  | { type: "quit" }
  | { type: "crash"; lastLife: boolean }
  | { type: "roundCleared" }
  | { type: "nextRound" };

/** Events a player can cause directly. Crashes and cleared rounds only ever come from the simulation. */
export type PlayerEvent = Exclude<ScreenEvent, { type: "crash" } | { type: "roundCleared" }>;

export const TITLE: TitleScreen = { name: "title" };

const TIME_EPSILON = 1e-9;

/**
 * Returns the next screen. An event that makes no sense on the current screen
 * (pausing the title, starting an already running round) returns the same
 * screen object, so callers can compare by identity to see if anything changed.
 */
export function transition(screen: Screen, event: ScreenEvent): Screen {
  switch (screen.name) {
    case "title":
      if (event.type === "play") return { name: "ready" };
      if (event.type === "openScores") return { name: "scores" };
      if (event.type === "openSettings") return { name: "settings", back: screen };
      return screen;
    case "scores":
      return event.type === "back" ? TITLE : screen;
    case "settings":
      return event.type === "back" ? screen.back : screen;
    case "ready":
      if (event.type === "start") return { name: "playing" };
      if (event.type === "pause") return { name: "paused", resume: screen };
      return screen;
    case "playing":
      if (event.type === "pause") return { name: "paused", resume: screen };
      if (event.type === "crash") return { name: "crash", timeLeft: CRASH_DURATION, lastLife: event.lastLife };
      if (event.type === "roundCleared") return { name: "roundComplete" };
      return screen;
    case "crash":
      if (event.type === "pause") return { name: "paused", resume: screen };
      return screen;
    case "paused":
      if (event.type === "resume") return screen.resume;
      if (event.type === "openSettings") return { name: "settings", back: screen };
      if (event.type === "quit") return TITLE;
      return screen;
    case "roundComplete":
      return event.type === "nextRound" ? { name: "ready" } : screen;
    case "gameOver":
      if (event.type === "play") return { name: "ready" };
      if (event.type === "quit") return TITLE;
      return screen;
  }
}

/** Advances timed screens. Only the crash animation runs on its own. */
export function tickScreen(screen: Screen, dt: number): Screen {
  if (screen.name !== "crash") return screen;
  const timeLeft = screen.timeLeft - dt;
  // 1.1 s is not a whole multiple of 1/120 in floating point, so after the
  // expected 132 steps a sliver of time is left. Without the tolerance the
  // animation would run one step longer than specified.
  if (timeLeft > TIME_EPSILON) return { ...screen, timeLeft };
  return screen.lastLife ? { name: "gameOver" } : { name: "ready" };
}

/**
 * The event behind the primary action of a screen: Enter, the space bar or a
 * tap on the touchpad. Screens without one return null.
 */
export function confirmEvent(screen: Screen): PlayerEvent | null {
  switch (screen.name) {
    case "title":
    case "gameOver":
      return { type: "play" };
    case "ready":
      return { type: "start" };
    case "paused":
      return { type: "resume" };
    case "roundComplete":
      return { type: "nextRound" };
    // Settings will hold a text field, where Enter must not leave the screen.
    case "scores":
    case "settings":
    case "playing":
    case "crash":
      return null;
  }
}

/** The event behind P or Esc: pause the game, or step back out of a menu. */
export function cancelEvent(screen: Screen): PlayerEvent | null {
  switch (screen.name) {
    case "ready":
    case "playing":
    case "crash":
      return { type: "pause" };
    case "paused":
      return { type: "resume" };
    case "scores":
    case "settings":
      return { type: "back" };
    case "title":
    case "roundComplete":
    case "gameOver":
      return null;
  }
}
