import { describe, expect, it } from "vitest";
import { CRASH_DURATION, FIXED_STEP, FLY_POINTS, ROUND_BONUS_PER_ROUND, START_LIVES } from "./config";
import { crash, createGame, createSession, dispatch, type Game, steer, update } from "./game";

function simulate(game: Game, seconds: number): void {
  const steps = Math.round(seconds / FIXED_STEP);
  for (let i = 0; i < steps; i++) update(game, FIXED_STEP);
}

function startRound(): Game {
  const game = createGame();
  dispatch(game, { type: "play" });
  dispatch(game, { type: "start" });
  return game;
}

describe("game", () => {
  it("starts on the title with a fresh session", () => {
    const game = createGame();
    expect(game.screen.name).toBe("title");
    expect(game.session).toEqual(createSession());
  });

  it("moves the spiders only while the round is running", () => {
    const game = createGame();
    dispatch(game, { type: "play" });
    const start = game.field.player.angle;
    simulate(game, 1);
    expect(game.field.player.angle).toBe(start);

    dispatch(game, { type: "start" });
    simulate(game, 0.5);
    dispatch(game, { type: "pause" });
    const paused = game.field.player.angle;
    expect(paused).not.toBe(start);
    simulate(game, 1);
    expect(game.field.player.angle).toBe(paused);
  });

  it("steers only while the round is running", () => {
    const game = createGame();
    dispatch(game, { type: "play" });
    expect(steer(game, "in")).toBe(false);
    dispatch(game, { type: "start" });
    // The player starts on the bottom gate, so the next gate is a quarter lap
    // away: about 2.1 s on the outer ring, the turn zone opens after 1.7 s.
    expect(steer(game, "in")).toBe(false);
    simulate(game, 1.9);
    expect(steer(game, "in")).toBe(true);
  });

  it("puts every spider back to the start after a crash", () => {
    const game = startRound();
    simulate(game, 1);
    crash(game);
    simulate(game, CRASH_DURATION);
    expect(game.field).toEqual(createGame().field);
  });

  it("reports commands the current screen ignores", () => {
    const game = createGame();
    expect(dispatch(game, { type: "pause" })).toBe(false);
    expect(dispatch(game, { type: "play" })).toBe(true);
  });

  it("takes a life on a crash and waits for the player after the animation", () => {
    const game = startRound();
    expect(crash(game)).toBe(true);
    expect(game.session.lives).toBe(START_LIVES - 1);
    expect(game.screen.name).toBe("crash");
    simulate(game, CRASH_DURATION);
    expect(game.screen.name).toBe("ready");
  });

  it("ignores a second crash during the animation", () => {
    const game = startRound();
    crash(game);
    expect(crash(game)).toBe(false);
    expect(game.session.lives).toBe(START_LIVES - 1);
  });

  it("ends the game when the last life is lost", () => {
    const game = startRound();
    for (let life = 0; life < START_LIVES; life++) {
      dispatch(game, { type: "start" });
      crash(game);
      simulate(game, CRASH_DURATION);
    }
    expect(game.session.lives).toBe(0);
    expect(game.screen.name).toBe("gameOver");
  });

  it("moves to the next round only when the player confirms", () => {
    const game = startRound();
    clearRound(game);
    expect(game.screen.name).toBe("roundComplete");
    expect(game.session.round).toBe(1);
    dispatch(game, { type: "nextRound" });
    expect(game.session.round).toBe(2);
    expect(game.screen.name).toBe("ready");
  });

  it("starts a new game with a fresh session after game over", () => {
    const game = startRound();
    game.session.lives = 1;
    crash(game);
    simulate(game, CRASH_DURATION);
    dispatch(game, { type: "play" });
    expect(game.session).toEqual(createSession());
  });
});

/** Leaves one fly right in front of the player and runs until it is eaten. */
function clearRound(game: Game): void {
  const { flies, player } = game.field;
  for (const fly of flies) fly.collected = true;
  const last = flies.find((f) => f.ring === player.ring && Math.abs(f.angle - (player.angle - 0.2)) < 0.3)!;
  last.collected = false;
  simulate(game, 0.5);
}

describe("flies and scoring", () => {
  it("scores 10 points per fly", () => {
    const game = startRound();
    // The first fly on the outer ring is 15° ahead of the start; at 0.76 rad/s it takes about 0.3 s.
    simulate(game, 0.5);
    expect(game.session.score).toBe(FLY_POINTS);
    expect(game.session.roundPoints).toBe(FLY_POINTS);
  });

  it("ends the round with the last fly and adds 100 points per round number", () => {
    const game = startRound();
    clearRound(game);
    expect(game.session.roundBonus).toBe(ROUND_BONUS_PER_ROUND);
    expect(game.session.score).toBe(FLY_POINTS + ROUND_BONUS_PER_ROUND);

    dispatch(game, { type: "nextRound" });
    dispatch(game, { type: "start" });
    clearRound(game);
    expect(game.session.roundBonus).toBe(2 * ROUND_BONUS_PER_ROUND);
  });

  it("starts each round with a full web for that round", () => {
    const game = startRound();
    for (let round = 1; round < 4; round++) {
      clearRound(game);
      dispatch(game, { type: "nextRound" });
      dispatch(game, { type: "start" });
    }
    expect(game.session.round).toBe(4);
    expect(game.field.ringCount).toBe(4);
    expect(game.field.enemies).toHaveLength(2);
    expect(game.field.flies.filter((f) => !f.collected)).toHaveLength(48);
    expect(game.session.roundPoints).toBe(0);
  });

  it("brings all flies back after a crash but keeps the score", () => {
    const game = startRound();
    simulate(game, 0.5);
    const score = game.session.score;
    crash(game);
    simulate(game, CRASH_DURATION);
    expect(game.field.flies.every((f) => !f.collected)).toBe(true);
    expect(game.session.score).toBe(score);
  });

  it("crashes when an enemy reaches the player", () => {
    const game = startRound();
    const enemy = game.field.enemies[0]!;
    enemy.ring = game.field.player.ring;
    enemy.angle = game.field.player.angle - 0.4;
    simulate(game, 1);
    expect(game.screen.name).not.toBe("playing");
    expect(game.session.lives).toBe(START_LIVES - 1);
  });
});
