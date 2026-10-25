import { describe, expect, it } from "vitest";
import { CRASH_DURATION, FIXED_STEP, START_LIVES } from "./config";
import { crash, createGame, dispatch, type Game, update } from "./game";

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
    expect(game.session).toEqual({ round: 1, lives: START_LIVES, score: 0, playTime: 0 });
  });

  it("counts play time only while the round is running", () => {
    const game = createGame();
    dispatch(game, { type: "play" });
    simulate(game, 1);
    expect(game.session.playTime).toBe(0);

    dispatch(game, { type: "start" });
    simulate(game, 2);
    dispatch(game, { type: "pause" });
    simulate(game, 5);
    expect(game.session.playTime).toBeCloseTo(2);
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
    expect(game.session).toEqual({ round: 1, lives: START_LIVES, score: 0, playTime: 0 });
  });
});
