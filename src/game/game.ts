// Top-level game state: the current screen plus the running game session.
// The browser layer (main.ts) only sends commands and calls update() with
// fixed steps; everything that decides what happens lives here.

import { START_LIVES } from "./config";
import { type PlayerEvent, type Screen, type ScreenEvent, TITLE, tickScreen, transition } from "./screens";

/** One game from Hrát to Konec hry. Later chapters add the web, spiders and flies. */
export type Session = {
  /** Round number, counts from 1 and only grows (spec chapter 6). */
  round: number;
  lives: number;
  score: number;
  /** Simulated time spent in the playing screen; stops while paused. */
  playTime: number;
};

export type Game = {
  screen: Screen;
  session: Session;
};

/** A crash is not a command: it goes through crash(), which also takes the life. */
export type Command = PlayerEvent;

export function createSession(): Session {
  return { round: 1, lives: START_LIVES, score: 0, playTime: 0 };
}

export function createGame(): Game {
  return { screen: TITLE, session: createSession() };
}

/** Applies a command. Returns false when the current screen ignores it. */
export function dispatch(game: Game, command: Command): boolean {
  return applyEvent(game, command);
}

/** The player's spider hit an enemy: lose a life and play the crash animation. */
export function crash(game: Game): boolean {
  if (game.screen.name !== "playing") return false;
  game.session.lives -= 1;
  return applyEvent(game, { type: "crash", lastLife: game.session.lives <= 0 });
}

/** Advances the game by one fixed step of dt seconds. */
export function update(game: Game, dt: number): void {
  if (game.screen.name === "playing") game.session.playTime += dt;
  game.screen = tickScreen(game.screen, dt);
}

function applyEvent(game: Game, event: ScreenEvent): boolean {
  const next = transition(game.screen, event);
  if (next === game.screen) return false;
  if (event.type === "play") game.session = createSession();
  if (event.type === "nextRound") game.session.round += 1;
  game.screen = next;
  return true;
}
