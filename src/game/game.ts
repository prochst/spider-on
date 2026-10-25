// Top-level game state: the current screen, the running game session and the
// field of the current round. The browser layer (main.ts) only sends
// commands and calls update() with fixed steps; everything that decides what
// happens lives here.

import { FLY_POINTS, ROUND_BONUS_PER_ROUND, START_LIVES } from "./config";
import { createField, type Field, playerHitsEnemy, steerPlayer, stepField } from "./field";
import { collectFlies, fliesLeft } from "./flies";
import { difficultyForRound, enemiesForDifficulty, ringCountForRound } from "./progression";
import { type PlayerEvent, type Screen, type ScreenEvent, TITLE, tickScreen, transition } from "./screens";
import { addPoints } from "./scoring";
import type { Turn } from "./spider";

/** One game from Hrát to Konec hry. */
export type Session = {
  /** Round number, counts from 1 and only grows (spec chapter 6). */
  round: number;
  lives: number;
  score: number;
  /** Points for flies in the current round, kept across crashes; shown on the Kolo dokončeno screen. */
  roundPoints: number;
  /** Bonus for the last finished round. */
  roundBonus: number;
};

export type Game = {
  screen: Screen;
  session: Session;
  field: Field;
  /** Whether the player holds the throttle; the input layer keeps it current. */
  throttle: boolean;
};

/** Crashes and cleared rounds are not commands: the simulation decides them in update(). */
export type Command = PlayerEvent;

export function createSession(): Session {
  return { round: 1, lives: START_LIVES, score: 0, roundPoints: 0, roundBonus: 0 };
}

function createRoundField(round: number): Field {
  return createField(ringCountForRound(round), enemiesForDifficulty(difficultyForRound(round)));
}

export function createGame(): Game {
  return { screen: TITLE, session: createSession(), field: createRoundField(1), throttle: false };
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

/** Debug shortcut: eats every fly at once, so the next step finishes the round. */
export function debugEatAllFlies(game: Game): void {
  if (game.screen.name !== "playing") return;
  for (const fly of game.field.flies) fly.collected = true;
}

/** Advances the game by one fixed step of dt seconds. */
export function update(game: Game, dt: number): void {
  if (game.screen.name === "playing") playStep(game, dt);
  const previous = game.screen;
  game.screen = tickScreen(game.screen, dt);
  // After a crash the whole field starts over, flies included (spec chapter 8).
  if (previous.name === "crash" && game.screen.name === "ready") game.field = createRoundField(game.session.round);
}

function playStep(game: Game, dt: number): void {
  const { field, session } = game;
  stepField(field, dt, game.throttle);

  const collected = collectFlies(field.flies, field.player);
  if (collected > 0) {
    session.roundPoints += collected * FLY_POINTS;
    addPoints(session, collected * FLY_POINTS);
  }
  // The last fly wins over a crash in the same step: the player reached it first.
  if (fliesLeft(field.flies) === 0) {
    finishRound(game);
    return;
  }
  if (playerHitsEnemy(field)) crash(game);
}

function finishRound(game: Game): void {
  const { session } = game;
  session.roundBonus = ROUND_BONUS_PER_ROUND * session.round;
  addPoints(session, session.roundBonus);
  applyEvent(game, { type: "roundCleared" });
}

function applyEvent(game: Game, event: ScreenEvent): boolean {
  const next = transition(game.screen, event);
  if (next === game.screen) return false;
  if (event.type === "play") game.session = createSession();
  if (event.type === "nextRound") game.session.round += 1;
  if (event.type === "play" || event.type === "nextRound") {
    game.session.roundPoints = 0;
    game.field = createRoundField(game.session.round);
  }
  game.screen = next;
  return true;
}
