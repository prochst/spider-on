import { describe, expect, it } from "vitest";
import { CRASH_DURATION, FIXED_STEP, START_LIVES } from "./config";
import { crash, createGame, dispatch, type Game, steer, update } from "./game";

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
    expect(game.session).toEqual({ round: 1, lives: START_LIVES, score: 0 });
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
    dispatch(game, { type: "roundCleared" });
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
    expect(game.session).toEqual({ round: 1, lives: START_LIVES, score: 0 });
  });
});
