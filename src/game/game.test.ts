import { describe, expect, it } from "vitest";
import {
  BONUS_FIRST_ROUND,
  BONUS_NOTICE_TIME,
  BONUS_POINTS,
  CRASH_DURATION,
  FIXED_STEP,
  FLY_POINTS,
  MAX_LIVES,
  ROUND_BONUS_PER_ROUND,
  PLAYER_SPEED,
  START_LIVES,
  TURN_ZONE,
} from "./config";
import { ringRadius } from "./geometry";
import { crash, createGame, createSession, dispatch, type Game, steer, steerToward, update } from "./game";

function simulate(game: Game, seconds: number): void {
  const steps = Math.round(seconds / FIXED_STEP);
  for (let i = 0; i < steps; i++) update(game, FIXED_STEP);
}

/** Time the player needs to crawl the given angle on the outer ring of the first web. */
function timeToCrawl(degrees: number): number {
  return (degrees * (Math.PI / 180) * ringRadius(2, 3)) / PLAYER_SPEED;
}

/** Long enough to eat the first fly or package 15° ahead of the start, too short to reach the next one. */
const PAST_FIRST_FLY = timeToCrawl(20);

function startRound(): Game {
  const game = createGame(1);
  dispatch(game, { type: "play" });
  dispatch(game, { type: "start" });
  return game;
}

describe("game", () => {
  it("starts on the title with a fresh session", () => {
    const game = createGame(1);
    expect(game.screen.name).toBe("title");
    expect(game.session).toEqual(createSession());
  });

  it("moves the spiders only while the round is running", () => {
    const game = createGame(1);
    dispatch(game, { type: "play" });
    const start = game.field.player.angle;
    simulate(game, 1);
    expect(game.field.player.angle).toBe(start);

    dispatch(game, { type: "start" });
    simulate(game, PAST_FIRST_FLY);
    dispatch(game, { type: "pause" });
    const paused = game.field.player.angle;
    expect(paused).not.toBe(start);
    simulate(game, 1);
    expect(game.field.player.angle).toBe(paused);
  });

  it("steers only while the round is running", () => {
    const game = createGame(1);
    dispatch(game, { type: "play" });
    expect(steer(game, "in")).toBe(false);
    dispatch(game, { type: "start" });
    // The player starts on the bottom gate, so the next gate is a quarter lap
    // away; the turn zone opens shortly before it.
    expect(steer(game, "in")).toBe(false);
    const angularSpeed = PLAYER_SPEED / ringRadius(2, 3);
    simulate(game, (Math.PI / 2 - TURN_ZONE / 2) / angularSpeed);
    expect(steer(game, "in")).toBe(true);
  });

  it("puts every spider back to the start after a crash", () => {
    const game = startRound();
    simulate(game, 1);
    crash(game);
    simulate(game, CRASH_DURATION);
    const fresh = createGame(1).field;
    expect(game.field.player).toEqual(fresh.player);
    expect(game.field.enemies).toEqual(fresh.enemies);
    expect(game.field.flies).toEqual(fresh.flies);
  });

  it("reports commands the current screen ignores", () => {
    const game = createGame(1);
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
  simulate(game, PAST_FIRST_FLY);
}

describe("flies and scoring", () => {
  it("scores 10 points per fly", () => {
    const game = startRound();
    simulate(game, PAST_FIRST_FLY);
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
    simulate(game, PAST_FIRST_FLY);
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

describe("bonus packages", () => {
  function roundWithPackage(kind: "points" | "slowdown" | "life"): Game {
    const game = startRound();
    // The first fly ahead of the player sits 15° before the start, on the outer ring.
    const fly = game.field.flies.find((f) => f.ring === 2 && Math.abs(f.angle - 75 * (Math.PI / 180)) < 1e-9)!;
    fly.collected = true;
    game.field.bonus.package = { ring: 2, angle: fly.angle, kind };
    return game;
  }

  it("appear only from the configured round", () => {
    const game = startRound();
    const enabled: boolean[] = [];
    for (let round = 1; round <= 7; round++) {
      enabled.push(game.field.bonus.enabled);
      clearRound(game);
      dispatch(game, { type: "nextRound" });
      dispatch(game, { type: "start" });
    }
    expect(enabled).toEqual(enabled.map((_, i) => i + 1 >= BONUS_FIRST_ROUND));
  });

  it("give 250 points", () => {
    const game = roundWithPackage("points");
    simulate(game, PAST_FIRST_FLY);
    expect(game.session.score).toBe(BONUS_POINTS);
  });

  it("give an extra life, but never more than five", () => {
    const game = roundWithPackage("life");
    simulate(game, PAST_FIRST_FLY);
    expect(game.session.lives).toBe(START_LIVES + 1);

    const full = roundWithPackage("life");
    full.session.lives = MAX_LIVES;
    simulate(full, PAST_FIRST_FLY);
    expect(full.session.lives).toBe(MAX_LIVES);
  });

  it("tell what the player got for three seconds", () => {
    const game = roundWithPackage("slowdown");
    simulate(game, PAST_FIRST_FLY);
    expect(game.field.bonus.notice?.kind).toBe("slowdown");
    simulate(game, BONUS_NOTICE_TIME);
    expect(game.field.bonus.notice).toBeNull();
  });

  it("say so when a life package finds all lives full", () => {
    const game = roundWithPackage("life");
    game.session.lives = MAX_LIVES;
    simulate(game, PAST_FIRST_FLY);
    expect(game.field.bonus.notice?.kind).toBe("livesFull");
  });

  it("lose the package and the slowdown after a crash", () => {
    const game = roundWithPackage("slowdown");
    simulate(game, PAST_FIRST_FLY);
    expect(game.field.bonus.slowdownLeft).toBeGreaterThan(0);
    crash(game);
    simulate(game, CRASH_DURATION);
    expect(game.field.bonus.slowdownLeft).toBe(0);
    expect(game.field.bonus.package).toBeNull();
    expect(game.field.bonus.notice).toBeNull();
  });
});

describe("determinism", () => {
  it("plays the same game twice from the same seed", () => {
    const play = (seed: number) => {
      const game = createGame(seed);
      dispatch(game, { type: "play" });
      dispatch(game, { type: "start" });
      for (let i = 0; i < 120 * 20 && game.screen.name === "playing"; i++) {
        if (i % 240 === 200) steer(game, i % 480 < 240 ? "in" : "out");
        update(game, FIXED_STEP);
      }
      return JSON.stringify({ screen: game.screen, session: game.session, field: game.field });
    };
    expect(play(5)).toBe(play(5));
    expect(play(5)).not.toBe(play(6));
  });
});

describe("steering by screen direction", () => {
  it("turns at the right gate with the right and left arrows", () => {
    const game = startRound();
    // From the bottom the player crawls toward the right gate (0°).
    simulate(game, timeToCrawl(90) - timeToCrawl(10));
    expect(steerToward(game, 0, 1)).toBe(false);
    expect(steerToward(game, -1, 0)).toBe(true);
    expect(game.field.player.pending).toBe("in");
  });
});

describe("events for the sounds", () => {
  it("lists an eaten fly", () => {
    const game = startRound();
    simulate(game, PAST_FIRST_FLY);
    expect(game.events).toEqual(["fly"]);
  });

  it("lists every climb to the next ring", () => {
    const game = startRound();
    const angularSpeed = PLAYER_SPEED / ringRadius(2, 3);
    simulate(game, (Math.PI / 2 - TURN_ZONE / 2) / angularSpeed);
    game.events.length = 0;
    steer(game, "in");
    while (!game.field.player.crossing) update(game, FIXED_STEP);
    expect(game.events).toEqual(["climb"]);
    // Asking once more during the climb goes on to the innermost ring: a second climb.
    expect(steer(game, "in")).toBe(true);
    simulate(game, 0.6);
    expect(game.events.filter((e) => e === "climb")).toHaveLength(2);
  });

  it("lists a cleared round", () => {
    const game = startRound();
    clearRound(game);
    expect(game.events).toContain("roundClear");
  });

  it("lists each crash and the end of the game after the last one", () => {
    const game = startRound();
    game.session.lives = 2;
    crash(game);
    simulate(game, CRASH_DURATION);
    expect(game.events).toEqual(["crash"]);
    dispatch(game, { type: "start" });
    crash(game);
    simulate(game, CRASH_DURATION);
    expect(game.events).toEqual(["crash", "crash", "gameOver"]);
  });
});
