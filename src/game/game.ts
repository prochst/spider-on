// Top-level game state: the current screen, the running game session and the
// field of the current round. The browser layer (main.ts) only sends
// commands and calls update() with fixed steps; everything that decides what
// happens lives here.

import { ENEMY_SLOW_FACTOR, MIN_RING_COUNT, START_LIVES } from "./config";
import { createField, type Field, steerPlayer, stepField } from "./field";
import { type PlayerEvent, type Screen, type ScreenEvent, TITLE, tickScreen, transition } from "./screens";
import type { Turn } from "./spider";

/** One game from Hrát to Konec hry. */
export type Session = {
  /** Round number, counts from 1 and only grows (spec chapter 6). */
  round: number;
  lives: number;
  score: number;
};

export type Game = {
  screen: Screen;
  session: Session;
  field: Field;
  /** Whether the player holds the throttle; the input layer keeps it current. */
  throttle: boolean;
};

/** A crash is not a command: it goes through crash(), which also takes the life. */
export type Command = PlayerEvent;

export function createSession(): Session {
  return { round: 1, lives: START_LIVES, score: 0 };
}

// Until rounds and difficulty arrive in chapters 2.3 and 2.4, every round
// is round 1: the small web with one slow enemy.
function createRoundField(): Field {
  return createField(MIN_RING_COUNT, { count: 1, speedFactor: ENEMY_SLOW_FACTOR });
}

export function createGame(): Game {
  return { screen: TITLE, session: createSession(), field: createRoundField(), throttle: false };
}

/** Applies a command. Returns false when the current screen ignores it. */
export function dispatch(game: Game, command: Command): boolean {
  return applyEvent(game, command);
}

/** The player asks to climb to another ring; only while the round runs. */
export function steer(game: Game, turn: Turn): boolean {
  if (game.screen.name !== "playing") return false;
  return steerPlayer(game.field, turn, game.throttle);
}

/** The player's spider hit an enemy: lose a life and play the crash animation. */
export function crash(game: Game): boolean {
  if (game.screen.name !== "playing") return false;
  game.session.lives -= 1;
  return applyEvent(game, { type: "crash", lastLife: game.session.lives <= 0 });
}

/** Advances the game by one fixed step of dt seconds. */
export function update(game: Game, dt: number): void {
  if (game.screen.name === "playing") stepField(game.field, dt, game.throttle);
  const previous = game.screen;
  game.screen = tickScreen(game.screen, dt);
  // After a crash the whole field starts over (spec chapter 8).
  if (previous.name === "crash" && game.screen.name === "ready") game.field = createRoundField();
}

function applyEvent(game: Game, event: ScreenEvent): boolean {
  const next = transition(game.screen, event);
  if (next === game.screen) return false;
  if (event.type === "play") game.session = createSession();
  if (event.type === "nextRound") game.session.round += 1;
  if (event.type === "play" || event.type === "nextRound") game.field = createRoundField();
  game.screen = next;
  return true;
}
