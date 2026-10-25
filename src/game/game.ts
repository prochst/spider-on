// Top-level game state: the current screen, the running game session and the
// field of the current round. The browser layer (main.ts) only sends
// commands and calls update() with fixed steps; everything that decides what
// happens lives here.

import { type BonusKind, createBonusState, updateBonus } from "./bonus";
import { BONUS_FIRST_ROUND, BONUS_POINTS, FLY_POINTS, MAX_LIVES, ROUND_BONUS_PER_ROUND, START_LIVES } from "./config";
import { createField, type Field, playerHitsEnemy, steerPlayer, stepField } from "./field";
import { collectFlies, fliesLeft } from "./flies";
import { difficultyForRound, enemiesForDifficulty, ringCountForRound } from "./progression";
import { type PlayerEvent, type Screen, type ScreenEvent, TITLE, tickScreen, transition } from "./screens";
import { createRandom, type Random } from "./random";
import { addPoints } from "./scoring";
import { type Turn, turnForDirection } from "./spider";

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
  /** The only source of chance in the game; the same seed replays the same game. */
  random: Random;
};

/** Crashes and cleared rounds are not commands: the simulation decides them in update(). */
export type Command = PlayerEvent;

export function createSession(): Session {
  return { round: 1, lives: START_LIVES, score: 0, roundPoints: 0, roundBonus: 0 };
}

function createRoundField(round: number, random: Random): Field {
  const level = difficultyForRound(round);
  const bonus = createBonusState(round >= BONUS_FIRST_ROUND, random);
  return createField(ringCountForRound(round), enemiesForDifficulty(level), level, bonus);
}

export function createGame(seed: number): Game {
  const random = createRandom(seed);
  return { screen: TITLE, session: createSession(), field: createRoundField(1, random), throttle: false, random };
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

/**
 * Steers by a direction on screen (x right, y down), read along the gate
 * spoke the player heads for. The arrow keys use it; so will swipes on
 * the touchpad.
 */
export function steerToward(game: Game, dx: number, dy: number): boolean {
  const turn = turnForDirection(game.field.player, dx, dy);
  return turn !== null && steer(game, turn);
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
  if (previous.name === "crash" && game.screen.name === "ready") {
    game.field = createRoundField(game.session.round, game.random);
  }
}

function playStep(game: Game, dt: number): void {
  const { field, session } = game;
  const angleBefore = field.player.angle;
  stepField(field, dt, game.throttle, game.random);

  const collected = collectFlies(field.flies, field.player);
  if (collected > 0) {
    session.roundPoints += collected * FLY_POINTS;
    addPoints(session, collected * FLY_POINTS);
  }
  const eaten = updateBonus(field.bonus, field.flies, field.player, angleBefore, dt, game.random);
  if (eaten) applyBonus(session, eaten);
  // The last fly wins over a crash in the same step: the player reached it first.
  if (fliesLeft(field.flies) === 0) {
    finishRound(game);
    return;
  }
  if (playerHitsEnemy(field)) crash(game);
}

/** The slowdown is already running inside the field; points and lives belong to the session. */
function applyBonus(session: Session, kind: BonusKind): void {
  if (kind === "points") addPoints(session, BONUS_POINTS);
  if (kind === "life") session.lives = Math.min(session.lives + 1, MAX_LIVES);
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
    game.field = createRoundField(game.session.round, game.random);
  }
  game.screen = next;
  return true;
}
